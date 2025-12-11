## Composants

### 1. InvoicePDF

Composant React-PDF qui génère le document PDF.

```tsx
import { InvoicePDF } from '@/features/invoices/components'
;<InvoicePDF
  invoice={invoice}
  booking={booking}
  property={property}
  client={client}
  settings={settings}
/>
```

### 2. DownloadInvoiceButton (Client-side)

Bouton de téléchargement qui génère le PDF côté client.

```tsx
import { DownloadInvoiceButton } from '@/features/invoices/components'
;<DownloadInvoiceButton
  invoice={invoice}
  booking={booking}
  property={property}
  client={client}
  settings={settings}
/>
```

**Avantages :**

- Génération instantanée
- Pas de charge serveur
- Prévisualisation possible

**Inconvénients :**

- Charge le navigateur
- Plus de données transférées
- Nécessite JavaScript activé

### 3. DownloadInvoiceServerButton (Server-side)

Bouton qui télécharge le PDF généré côté serveur.

```tsx
import { DownloadInvoiceServerButton } from '@/features/invoices/components'
;<DownloadInvoiceServerButton
  invoiceId="invoice-id-123"
  invoiceNumber="INV-001"
  variant="outline"
  size="default"
/>
```

**Avantages :**

- Performance optimale
- Moins de données côté client
- Meilleur pour mobile

**Inconvénients :**

- Requête serveur nécessaire
- Légèrement plus lent

## API Route

### GET /api/invoices/[id]/download

Génère et télécharge le PDF d'une facture.

**Paramètres :**

- `id` : ID de la facture

**Réponse :**

- PDF file avec headers appropriés

**Exemple :**

```typescript
const response = await fetch(`/api/invoices/${invoiceId}/download`)
const blob = await response.blob()
// Créer un lien de téléchargement
```

## Structure de données

### Invoice

```typescript
{
  invoiceNumber: string
  issueDate: Date | string
  dueDate: Date | string
  amount: number
  status: string
}
```

### Booking

```typescript
{
  id: string
  startDate: Date | string
  endDate: Date | string
  totalPrice: number
  basePrice: number
  cleaningFee?: number
  taxes?: number
  adults: number
  children: number
  discount?: number
  discountType?: string
  hasLinens?: boolean
  linensPrice?: number
  hasCleaning?: boolean
  cleaningPrice?: number
  hasCancellationInsurance?: boolean
  insuranceFee?: number
  specialRequests?: string
}
```

### Property

```typescript
{
  name: string
  address?: string
  description?: string
}
```

### Client

```typescript
{
  firstName: string
  lastName: string
  email: string
  phone?: string
  address?: string
  zipCode?: string
  city?: string
}
```

### Settings

```typescript
{
  companyName?: string
  companyAddress?: string
  companyPhoneNumber?: string
  companyEmail?: string
  currencySymbol?: string
  invoicePaymentInstructions?: string
  cancellationInsuranceProviderName?: string
}
```

## Exemple d'utilisation complet

### Dans une page Next.js

```tsx
import { DownloadInvoiceButton, DownloadInvoiceServerButton } from '@/features/invoices/components'

export default function InvoicePage({ invoice, booking, property, client, settings }) {
  return (
    <div>
      <h1>Facture {invoice.invoiceNumber}</h1>

      {/* Méthode 1 : Génération côté client */}
      <DownloadInvoiceButton
        invoice={invoice}
        booking={booking}
        property={property}
        client={client}
        settings={settings}
      />

      {/* Méthode 2 : Génération côté serveur */}
      <DownloadInvoiceServerButton invoiceId={invoice.id} invoiceNumber={invoice.invoiceNumber} />
    </div>
  )
}
```

## Personnalisation

### Styles

Les styles sont définis dans `InvoicePDF.tsx` via `StyleSheet.create()`. Modifiez les couleurs, fonts, et layout selon vos besoins.

### Contenu

Pour ajouter des sections, modifiez le composant `InvoicePDF` :

- Ajoutez des `<View>` pour de nouvelles sections
- Utilisez `<Text>` pour le contenu
- Appliquez les styles avec la prop `style`

### Format

Le PDF est en A4 par défaut. Pour changer :

```tsx
<Page size="LETTER" style={styles.page}>
```

## Dépendances

- `@react-pdf/renderer` : Génération de PDF
- `date-fns` : Formatage des dates
- `lucide-react` : Icônes

## Notes

- Les fonts Roboto sont chargées depuis CDN
- Le formatage des dates est en français (`fr` locale)
- Le symbole de devise est configurable via Settings
- Les calculs sont arrondis à 2 décimales

## Troubleshooting

### Le PDF ne se génère pas

- Vérifiez que toutes les données requises sont présentes
- Assurez-vous que `@react-pdf/renderer` est installé
- Consultez la console pour les erreurs

### Problèmes de style

- Les styles React-PDF sont différents du CSS standard
- Utilisez `StyleSheet.create()` pour définir les styles
- Référez-vous à la documentation React-PDF

### Erreurs de formatage de date

- Assurez-vous que les dates sont des objets Date valides
- Utilisez `new Date()` pour convertir les chaînes
- Vérifiez le format ISO 8601
