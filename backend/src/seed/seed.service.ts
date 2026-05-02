import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from '../books/entities/book.entity';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
    constructor(
        @InjectRepository(Book)
        private booksRepository: Repository<Book>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async onModuleInit() {
        await this.seedData();
    }

    async seedData() {
        // Check if data already exists
        const bookCount = await this.booksRepository.count();
        const userCount = await this.usersRepository.count();

        if (bookCount === 0) {
            console.log('📚 Seeding books...');
            await this.seedBooks();
        }

        if (userCount === 0) {
            console.log('👤 Seeding users...');
            await this.seedUsers();
        }

        console.log('✅ Database seeding complete!');
    }

    private async seedBooks() {
        const books = [
            {
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                genre: "Fiction",
                description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
                cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
                rating: 4.7,
                totalCopies: 5,
                availableCopies: 3,
                isbn: "978-0743273565",
                publisher: "Scribner",
                year: 1925,
                pages: 180,
                isFeatured: true,
                isNewArrival: false,
            },
            {
                title: "To Kill a Mockingbird",
                author: "Harper Lee",
                genre: "Fiction",
                description: "To Kill a Mockingbird is a novel by the American author Harper Lee. It was published in 1960 and was instantly successful. In the United States, it is widely read in high schools and middle schools.",
                cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=800",
                rating: 4.8,
                totalCopies: 3,
                availableCopies: 0,
                isbn: "978-0446310789",
                publisher: "J. B. Lippincott & Co.",
                year: 1960,
                pages: 281,
                isFeatured: true,
                isNewArrival: false,
            },
            {
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                genre: "Science",
                description: "A Brief History of Time: From the Big Bang to Black Holes is a popular-science book on cosmology by English physicist Stephen Hawking.",
                cover: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800",
                rating: 4.6,
                totalCopies: 5,
                availableCopies: 5,
                isbn: "978-0553380163",
                publisher: "Bantam Books",
                year: 1988,
                pages: 212,
                isFeatured: false,
                isNewArrival: true,
            },
            {
                title: "Clean Code",
                author: "Robert C. Martin",
                genre: "Technology",
                description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code.",
                cover: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
                rating: 4.9,
                totalCopies: 4,
                availableCopies: 2,
                isbn: "978-0132350884",
                publisher: "Prentice Hall",
                year: 2008,
                pages: 464,
                isFeatured: true,
                isNewArrival: false,
            },
            {
                title: "Sapiens: A Brief History of Humankind",
                author: "Yuval Noah Harari",
                genre: "History",
                description: "Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011.",
                cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800",
                rating: 4.5,
                totalCopies: 3,
                availableCopies: 1,
                isbn: "978-0062316097",
                publisher: "Harper",
                year: 2014,
                pages: 443,
                isFeatured: false,
                isNewArrival: true,
            },
            {
                title: "Dune",
                author: "Frank Herbert",
                genre: "Fiction",
                description: "Dune is a 1965 epic science fiction novel by American author Frank Herbert. It is the first installment of the Dune saga.",
                cover: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
                rating: 4.8,
                totalCopies: 6,
                availableCopies: 4,
                isbn: "978-0441172719",
                publisher: "Chilton Books",
                year: 1965,
                pages: 412,
                isFeatured: true,
                isNewArrival: false,
            },
            {
                title: "The Pragmatic Programmer",
                author: "Andrew Hunt, David Thomas",
                genre: "Technology",
                description: "The Pragmatic Programmer: From Journeyman to Master is a book about computer programming and software engineering.",
                cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
                rating: 4.9,
                totalCopies: 3,
                availableCopies: 2,
                isbn: "978-0201616224",
                publisher: "Addison-Wesley",
                year: 1999,
                pages: 352,
                isFeatured: false,
                isNewArrival: true,
            },
            {
                title: "Cosmos",
                author: "Carl Sagan",
                genre: "Science",
                description: "Cosmos is a 1980 popular science book by astronomer and Pulitzer Prize-winning author Carl Sagan.",
                cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                rating: 4.9,
                totalCopies: 4,
                availableCopies: 3,
                isbn: "978-0394502946",
                publisher: "Random House",
                year: 1980,
                pages: 365,
                isFeatured: true,
                isNewArrival: false,
            },
            {
                title: "1984",
                author: "George Orwell",
                genre: "Fiction",
                description: "Nineteen Eighty-Four is a dystopian social science fiction novel and cautionary tale by the English writer George Orwell.",
                cover: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?auto=format&fit=crop&q=80&w=800",
                rating: 4.7,
                totalCopies: 8,
                availableCopies: 6,
                isbn: "978-0451524935",
                publisher: "Secker & Warburg",
                year: 1949,
                pages: 328,
                isFeatured: false,
                isNewArrival: false,
            },
            {
                title: "Guns, Germs, and Steel",
                author: "Jared Diamond",
                genre: "History",
                description: "Guns, Germs, and Steel: The Fates of Human Societies is a 1997 transdisciplinary non-fiction book by Jared Diamond.",
                cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
                rating: 4.4,
                totalCopies: 3,
                availableCopies: 2,
                isbn: "978-0393038910",
                publisher: "W. W. Norton",
                year: 1997,
                pages: 480,
                isFeatured: false,
                isNewArrival: false,
            },
            {
                title: "Atomic Habits",
                author: "James Clear",
                genre: "Non-Fiction",
                description: "Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones is a 2018 self-help book by James Clear.",
                cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
                rating: 4.8,
                totalCopies: 12,
                availableCopies: 10,
                isbn: "978-0735211292",
                publisher: "Avery",
                year: 2018,
                pages: 320,
                isFeatured: true,
                isNewArrival: true,
            },
            {
                title: "The Alchemist",
                author: "Paulo Coelho",
                genre: "Fiction",
                description: "The Alchemist is a novel by Brazilian author Paulo Coelho that was first published in 1988.",
                cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
                rating: 4.6,
                totalCopies: 7,
                availableCopies: 5,
                isbn: "978-0062315007",
                publisher: "HarperTorch",
                year: 1988,
                pages: 163,
                isFeatured: false,
                isNewArrival: false,
            },
            {
                title: "Thinking, Fast and Slow",
                author: "Daniel Kahneman",
                genre: "Non-Fiction",
                description: "Thinking, Fast and Slow is a 2011 book by the Israeli-American psychologist Daniel Kahneman.",
                cover: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
                rating: 4.5,
                totalCopies: 4,
                availableCopies: 3,
                isbn: "978-0374275631",
                publisher: "Farrar, Straus and Giroux",
                year: 2011,
                pages: 499,
                isFeatured: false,
                isNewArrival: true,
            },
            {
                title: "Introduction to Algorithms",
                author: "Thomas H. Cormen",
                genre: "Technology",
                description: "Introduction to Algorithms is a book on computer programming and algorithms by Thomas H. Cormen et al.",
                cover: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&q=80&w=800",
                rating: 4.7,
                totalCopies: 2,
                availableCopies: 1,
                isbn: "978-0262033848",
                publisher: "MIT Press",
                year: 2009,
                pages: 1312,
                isFeatured: false,
                isNewArrival: false,
            },
            {
                title: "Silent Spring",
                author: "Rachel Carson",
                genre: "Science",
                description: "Silent Spring is an environmental science book by Rachel Carson documenting the adverse effects of pesticides.",
                cover: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
                rating: 4.6,
                totalCopies: 3,
                availableCopies: 2,
                isbn: "978-0618249060",
                publisher: "Houghton Mifflin",
                year: 1962,
                pages: 368,
                isFeatured: false,
                isNewArrival: false,
            },
        ];

        for (const bookData of books) {
            const book = this.booksRepository.create(bookData);
            await this.booksRepository.save(book);
        }

        console.log(`📚 Seeded ${books.length} books`);
    }

    private async seedUsers() {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const users = [
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'USER',
                memberId: 'MEM-2024-001',
                themePreference: 'light',
            },
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'USER',
                memberId: 'MEM-2024-002',
                themePreference: 'dark',
            },
        ];

        for (const userData of users) {
            const user = this.usersRepository.create(userData);
            await this.usersRepository.save(user);
        }

        console.log(`👤 Seeded ${users.length} users`);
        console.log('📧 Test accounts:');
        console.log('   User: john@example.com / password123');
        console.log('   User: jane@example.com / password123');
    }
}
