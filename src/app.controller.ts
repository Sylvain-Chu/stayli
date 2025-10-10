import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  home() {
    return {
      title: 'Home',
      sections: [
        {
          label: 'Bookings',
          links: [
            { label: 'Bookings list', href: '/bookings' },
            { label: 'Create a booking', href: '/bookings/create' },
          ],
        },
        {
          label: 'Clients',
          links: [
            { label: 'Clients list', href: '/clients' },
            { label: 'Add a client', href: '/clients/create' },
          ],
        },
        {
          label: 'Properties',
          links: [
            { label: 'Properties list', href: '/properties' },
            { label: 'Add a property', href: '/properties/create' },
          ],
        },
        {
          label: 'Invoices',
          links: [
            { label: 'Invoices list', href: '/invoices' },
            { label: 'Create an invoice', href: '/invoices/create' },
          ],
        },
      ],
    };
  }
}
