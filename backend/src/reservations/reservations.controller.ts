import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, CreateBulkReservationDto } from './dto/create-reservation.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as QRCode from 'qrcode';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@CurrentUser() user: any, @Body() createReservationDto: CreateReservationDto) {
        return this.reservationsService.create(user.id, createReservationDto);
    }

    @Post('checkout')
    @HttpCode(HttpStatus.CREATED)
    async checkout(@CurrentUser() user: any, @Body() createBulkReservationDto: CreateBulkReservationDto) {
        const result = await this.reservationsService.createBulk(user.id, createBulkReservationDto);
        // Use the reservationCode(s) for the QR code
        const qrData = result.reservationCodes || result.reservationId;
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);
        return {
            ...result,
            qrCode: qrCodeDataUrl,
        };
    }

    @Get()
    findAll(@CurrentUser() user: any) {
        return this.reservationsService.findAll(user.id);
    }

    @Get('active')
    findActive(@CurrentUser() user: any) {
        return this.reservationsService.findActive(user.id);
    }

    @Get('history')
    findHistory(@CurrentUser() user: any) {
        return this.reservationsService.findHistory(user.id);
    }

    @Get('stats')
    getStats(@CurrentUser() user: any) {
        return this.reservationsService.getStats(user.id);
    }

    @Get(':id')
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.reservationsService.findOne(id, user.id);
    }

    @Patch(':id/pickup')
    pickup(@CurrentUser() user: any, @Param('id') id: string) {
        return this.reservationsService.pickup(id, user.id);
    }

    @Patch(':id/return')
    return(@CurrentUser() user: any, @Param('id') id: string) {
        return this.reservationsService.return(id, user.id);
    }

    @Patch(':id/extend')
    extend(@CurrentUser() user: any, @Param('id') id: string) {
        return this.reservationsService.extend(id, user.id);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    cancel(@CurrentUser() user: any, @Param('id') id: string) {
        return this.reservationsService.cancel(id, user.id);
    }
}
