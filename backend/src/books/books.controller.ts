import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { BooksService } from './books.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('genre') genre?: string,
    @Query('featured') featured?: boolean,
    @Query('newArrivals') newArrivals?: boolean,
  ) {
    return this.booksService.findAll({ search, genre, featured, newArrivals });
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.booksService.getCategories();
  }

  @Public()
  @Get('featured')
  getFeatured() {
    return this.booksService.getFeatured();
  }

  @Public()
  @Get('new-arrivals')
  getNewArrivals() {
    return this.booksService.getNewArrivals();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.booksService.getBookDetails(+id, user?.id);
  }

  // Book-specific review endpoints
  @Public()
  @Get(':id/reviews')
  getBookReviews(@Param('id') id: string) {
    return this.booksService.getBookReviews(+id);
  }

  @Post(':id/reviews')
  @HttpCode(HttpStatus.CREATED)
  addBookReview(
    @Param('id') id: string, 
    @CurrentUser() user: any,
    @Body() reviewData: { rating: number; comment: string }
  ) {
    return this.booksService.addBookReview(+id, user.id, reviewData);
  }
}
