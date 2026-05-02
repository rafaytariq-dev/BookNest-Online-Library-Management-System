import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private booksRepository: Repository<Book>,
  ) { }

  async create(createReviewDto: CreateReviewDto) {
    const { userId, bookId, rating, comment } = createReviewDto;

    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const book = await this.booksRepository.findOneBy({ id: bookId });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const review = this.reviewsRepository.create({
      rating,
      comment,
      user,
      book,
    });

    return this.reviewsRepository.save(review);
  }

  findAll() {
    return this.reviewsRepository.find({
      relations: ['user', 'book'],
    });
  }

  findOne(id: string) {
    return this.reviewsRepository.findOne({
      where: { id },
      relations: ['user', 'book'],
    });
  }

  async findByBook(bookId: number) {
    return this.reviewsRepository.find({
      where: { book: { id: bookId } },
      relations: ['user'],
    });
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    return this.reviewsRepository.update(id, updateReviewDto);
  }

  remove(id: string) {
    return this.reviewsRepository.delete(id);
  }
}
