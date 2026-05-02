import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Book } from './entities/book.entity';
import { Review } from '../reviews/entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    // Check if ISBN already exists
    const existingBook = await this.booksRepository.findOne({ 
      where: { isbn: createBookDto.isbn } 
    });
    if (existingBook) {
      throw new ConflictException('A book with this ISBN already exists');
    }

    const book = this.booksRepository.create(createBookDto);
    return this.booksRepository.save(book);
  }

  async findAll(query?: { 
    search?: string; 
    genre?: string; 
    featured?: boolean;
    newArrivals?: boolean;
  }) {
    const queryBuilder = this.booksRepository.createQueryBuilder('book');

    if (query?.search) {
      queryBuilder.andWhere(
        '(LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.author) LIKE LOWER(:search))',
        { search: `%${query.search}%` }
      );
    }

    if (query?.genre && query.genre !== 'All') {
      queryBuilder.andWhere('book.genre = :genre', { genre: query.genre });
    }

    if (query?.featured) {
      queryBuilder.andWhere('book.isFeatured = :featured', { featured: true });
    }

    if (query?.newArrivals) {
      queryBuilder.andWhere('book.isNewArrival = :newArrival', { newArrival: true });
    }

    queryBuilder.orderBy('book.id', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['reviews', 'reviews.user'],
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }
    
    return book;
  }

  async getBookDetails(id: number, userId?: string) {
    const book = await this.booksRepository.findOne({
      where: { id },
      relations: ['reviews', 'reviews.user'],
    });
    
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    // Check if user has this book reserved/borrowed
    let userStatus: string | null = null;
    if (userId) {
      const activeReservation = await this.reservationsRepository.findOne({
        where: {
          bookId: id,
          userId,
          status: ReservationStatus.RESERVED,
        },
      });

      const borrowedReservation = await this.reservationsRepository.findOne({
        where: {
          bookId: id,
          userId,
          status: ReservationStatus.PICKEDUP,
        },
      });

      if (borrowedReservation) {
        userStatus = 'Borrowed';
      } else if (activeReservation) {
        userStatus = 'Reserved';
      }
    }

    // Calculate status
    let status: string;
    if (book.availableCopies === 0) {
      status = 'Out of Stock';
    } else if (userStatus) {
      status = userStatus;
    } else {
      status = 'Available';
    }

    // Format reviews
    const formattedReviews = book.reviews?.map(review => ({
      id: review.id,
      user: review.user?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      date: review.date,
    })) || [];

    return {
      ...book,
      copies: book.availableCopies,
      status,
      reviews: formattedReviews,
    };
  }

  async update(id: number, updateBookDto: UpdateBookDto) {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.booksRepository.update(id, updateBookDto);
    return this.booksRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    const book = await this.booksRepository.findOne({ where: { id } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    await this.booksRepository.delete(id);
    return { message: `Book with ID ${id} deleted successfully` };
  }

  async getCategories() {
    const books = await this.booksRepository.find({ select: ['genre'] });
    const genres = [...new Set(books.map(book => book.genre))];
    return genres.sort();
  }

  async getFeatured() {
    return this.booksRepository.find({
      where: { isFeatured: true },
      take: 8,
    });
  }

  async getNewArrivals() {
    return this.booksRepository.find({
      where: { isNewArrival: true },
      order: { createdAt: 'DESC' },
      take: 4,
    });
  }

  // Book review methods
  async getBookReviews(bookId: number) {
    const reviews = await this.reviewsRepository.find({
      where: { bookId },
      relations: ['user'],
      order: { date: 'DESC' },
    });

    return reviews.map(review => ({
      id: review.id,
      user: review.user?.name || 'Anonymous',
      rating: review.rating,
      comment: review.comment,
      date: review.date,
    }));
  }

  async addBookReview(bookId: number, userId: string, reviewData: { rating: number; comment: string }) {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user already reviewed this book
    const existingReview = await this.reviewsRepository.findOne({
      where: { bookId, userId },
    });
    if (existingReview) {
      throw new ConflictException('You have already reviewed this book');
    }

    // Validate rating
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    const review = this.reviewsRepository.create({
      rating: reviewData.rating,
      comment: reviewData.comment,
      userId,
      bookId,
    });

    await this.reviewsRepository.save(review);

    // Update book average rating
    await this.updateBookRating(bookId);

    return {
      id: review.id,
      user: user.name,
      rating: review.rating,
      comment: review.comment,
      date: review.date,
    };
  }

  private async updateBookRating(bookId: number) {
    const reviews = await this.reviewsRepository.find({ where: { bookId } });
    
    if (reviews.length === 0) {
      await this.booksRepository.update(bookId, { rating: 0 });
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    
    await this.booksRepository.update(bookId, { rating: averageRating });
  }

  async updateAvailableCopies(bookId: number, change: number) {
    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    const newAvailable = book.availableCopies + change;
    if (newAvailable < 0) {
      throw new BadRequestException('Not enough copies available');
    }

    await this.booksRepository.update(bookId, { availableCopies: newAvailable });
    return this.booksRepository.findOne({ where: { id: bookId } });
  }
}
