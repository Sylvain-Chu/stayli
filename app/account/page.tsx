import { AppLayout } from '@/components/layouts/app-shell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AccountPage() {
  return (
    <AppLayout title="Compte">
      <div className="max-w-2xl space-y-6">
        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-lg">Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/professional-avatar.png" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">JD</AvatarFallback>
              </Avatar>
              <Button variant="outline" className="bg-transparent">
                Changer la photo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue="Jean" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue="Dupont" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountEmail">Email</Label>
              <Input id="accountEmail" type="email" defaultValue="jean.dupont@stayli.fr" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card border">
          <CardHeader>
            <CardTitle className="text-lg">Sécurité</CardTitle>
            <CardDescription>Modifier votre mot de passe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="bg-primary hover:bg-primary/90">Mettre à jour</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
