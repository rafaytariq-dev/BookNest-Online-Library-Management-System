import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Book } from '../books/entities/book.entity';
import { Reservation, ReservationStatus } from '../reservations/entities/reservation.entity';
import { In } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['wishlist'],
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: string) {
    return this.usersRepository.delete(id);
  }

  // Theme preference
  async updateTheme(userId: string, theme: 'light' | 'dark') {
    await this.usersRepository.update(userId, { themePreference: theme });
    return { theme };
  }

  async getTheme(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    return { theme: user?.themePreference || 'light' };
  }

  // Dashboard data
  async getDashboardData(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get active reservations (borrowed books)
    const activeReservations = await this.reservationsRepository.find({
      where: {
        userId,
        status: In([ReservationStatus.RESERVED, ReservationStatus.PICKEDUP]),
      },
      relations: ['book'],
      order: { createdAt: 'DESC' },
    });

    // Get reservation history
    const history = await this.reservationsRepository.find({
      where: {
        userId,
        status: In([ReservationStatus.RETURNED, ReservationStatus.CANCELLED]),
      },
      relations: ['book'],
      order: { updatedAt: 'DESC' },
    });

    // Calculate stats
    const lifetimeBorrowed = await this.reservationsRepository.count({
      where: {
        userId,
        status: ReservationStatus.RETURNED,
      },
    });

    // Format borrowed books
    const borrowedBooks = activeReservations.map(res => {
      const now = new Date();
      const dueDate = new Date(res.dueDate);
      const isOverdue = res.status === ReservationStatus.PICKEDUP && now > dueDate;
      const daysRemaining = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: res.id,  // Reservation UUID (used for pickup, cancel, extend, return)
        bookId: res.book.id,  // Book ID (for reference)
        reservationCode: res.reservationCode,
        title: res.book.title,
        author: res.book.author,
        cover: res.book.cover,
        pickupDate: res.pickupDate,
        dueDate: res.dueDate,
        duration: res.duration,
        status: res.status,
        extended: res.extended,
        isOverdue,
        daysRemaining: res.status === ReservationStatus.PICKEDUP ? daysRemaining : null,
        fineAmount: isOverdue ? Math.abs(daysRemaining) * 2 : 0,
      };
    });

    // Format history
    const borrowingHistory = history.map(res => ({
      id: res.book.id,
      title: res.book.title,
      author: res.book.author,
      returnedDate: res.returnedAt,
      status: res.status,
    }));

    // Format wishlist
    const wishlist = user.wishlist.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      genre: book.genre,
      rating: book.rating,
    }));

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberId: user.memberId,
      },
      stats: {
        activeLoans: activeReservations.filter(r => r.status === ReservationStatus.PICKEDUP).length,
        currentReservations: activeReservations.filter(r => r.status === ReservationStatus.RESERVED).length,
        lifetimeBorrowed,
        wishlistCount: wishlist.length,
      },
      borrowedBooks,
      history: borrowingHistory,
      wishlist,
    };
  }

  // Wishlist methods
  async getWishlist(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user.wishlist.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      genre: book.genre,
      rating: book.rating,
      availableCopies: book.availableCopies,
    }));
  }

  async addToWishlist(userId: string, bookId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const book = await this.booksRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if book is already in wishlist
    if (user.wishlist.some(b => b.id === bookId)) {
      throw new ConflictException('Book is already in your wishlist');
    }

    user.wishlist.push(book);
    await this.usersRepository.save(user);

    return { message: 'Book added to wishlist', book: { id: book.id, title: book.title } };
  }

  async removeFromWishlist(userId: string, bookId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['wishlist'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const bookInWishlist = user.wishlist.find(book => book.id === bookId);
    if (!bookInWishlist) {
      throw new NotFoundException('Book not found in wishlist');
    }

    user.wishlist = user.wishlist.filter(book => book.id !== bookId);
    await this.usersRepository.save(user);

    return { message: 'Book removed from wishlist' };
  }
}
