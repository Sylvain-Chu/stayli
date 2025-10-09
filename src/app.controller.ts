import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  home() {
    return {
      title: 'Accueil',
      sections: [
        {
          label: 'Réservations',
          links: [
            { label: 'Liste des réservations', href: '/bookings' },
            { label: 'Créer une réservation', href: '/bookings/create' },
          ],
        },
        {
          label: 'Clients',
          links: [
            { label: 'Liste des clients', href: '/clients' },
            { label: 'Ajouter un client', href: '/clients/create' },
          ],
        },
        {
          label: 'Propriétés',
          links: [
            { label: 'Liste des propriétés', href: '/properties' },
            { label: 'Ajouter une propriété', href: '/properties/create' },
          ],
        },
        {
          label: 'Factures',
          links: [
            { label: 'Liste des factures', href: '/invoices' },
            { label: 'Créer une facture', href: '/invoices/create' },
          ],
        },
      ],
    };
  }
}
