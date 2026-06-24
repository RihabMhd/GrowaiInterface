# Frontend Documentation

## 1. Présentation du projet

Ce frontend correspond à l’interface d’administration d’une plateforme de gestion e-commerce.
Il permet de centraliser plusieurs opérations métier liées à l’activité de vente en ligne, notamment :

- la gestion des commandes ;
- le suivi des clients ;
- la gestion du catalogue produit ;
- la connexion aux sociétés de livraison ;
- le suivi des expéditions ;
- la gestion de l’équipe ;
- certains paramètres métier et intégrations externes, comme Shopify.

L’application est construite avec React et Vite, et communique avec un backend Laravel API.

---

## 2. Objectif de ce README

Ce README a pour but de faciliter la reprise du frontend par une nouvelle développeuse.
Il sert de point d’entrée rapide pour comprendre :

- la structure globale du frontend ;
- les principales pages et fonctionnalités ;
- la manière dont le frontend communique avec le backend ;
- les fichiers importants à lire en priorité ;
- les points sensibles à connaître avant de modifier le projet.

---

## 3. Stack technique

Le frontend repose principalement sur les technologies suivantes :

- React
- Vite
- React Router DOM
- Axios
- React Hook Form
- date-fns
- lucide-react
- CSS custom avec thème clair / sombre

D’autres dépendances sont présentes dans le projet, comme Zustand ou React Query, mais leur usage doit être vérifié selon les modules.

---

## 4. Lancement du projet

### Installation des dépendances

npm install

### Lancement en développement

npm run dev

Par défaut, le frontend démarre sur un serveur de développement Vite, généralement accessible via :

http://localhost:5173

### Build de production

npm run build

### Prévisualisation de la build

npm run preview

---

## 5. Configuration backend

Le frontend communique avec un backend Laravel API.
Avant de tester l’application, il faut donc s’assurer que :

- le backend est démarré ;
- l’URL de l’API configurée dans le frontend pointe vers le bon environnement ;
- les endpoints d’authentification et les endpoints métier sont disponibles.

Le client API principal est géré via le fichier axios.js, qui centralise la base URL et l’envoi du token d’authentification.

---

## 6. Structure générale du frontend

L’application est organisée autour de plusieurs blocs :

- Pages : écrans métier principaux ;
- Components : composants réutilisables ou spécifiques à un module ;
- Services : appels API organisés par domaine fonctionnel ;
- Contexts : gestion d’état global (auth, thème, langue, boutique) ;
- Layout : structure principale du dashboard ;
- API : client Axios partagé ;
- CSS : styles globaux et styles spécifiques à certaines pages.

Exemple de structure logique :

src/
├── api/
├── components/
├── contexts/
├── layouts/
├── pages/
├── services/
├── styles/
└── main.jsx

---

## 7. Fichiers importants à connaître

Les fichiers suivants structurent fortement le frontend et doivent être lus en priorité lors d’une reprise :

| Fichier | Rôle |
|---|---|
| main.jsx | Point d’entrée de l’application |
| AppRoutes.jsx | Déclaration des routes publiques et protégées |
| ProtectedRoute.jsx | Garde d’accès pour les routes authentifiées |
| DashboardLayout.jsx | Layout principal du dashboard |
| Sidebar.jsx | Navigation latérale |
| Navbar.jsx | Barre supérieure |
| AuthContext.jsx | Gestion de la session utilisateur |
| ThemeContext.jsx | Gestion du thème clair / sombre |
| LanguageContext.jsx | Gestion de la langue |
| ShopContext.jsx | Gestion du contexte boutique |
| axios.js | Client API partagé |
| authService.js | Opérations liées à l’authentification |
| teamService.js | Gestion de l’équipe |
| companiesService.js | Gestion des sociétés de livraison |
| shipmentsService.js | Gestion des expéditions |

---

## 8. Routing principal

### Routes publiques

| Route | Rôle |
|---|---|
| / | Connexion |
| /forgot-password | Mot de passe oublié |
| /reset-password | Réinitialisation du mot de passe |
| /auth/callback | Retour d’authentification |

### Routes protégées

| Route | Rôle |
|---|---|
| /dashboard | Dashboard principal |
| /commandes | Module commandes |
| /commandes/toutes | Liste des commandes |
| /commandes/abandonnees | Commandes abandonnées |
| /clients | Gestion des clients |
| /products | Gestion des produits |
| /companies | Gestion des sociétés de livraison |
| /companies/:id | Détail d’une société de livraison |
| /status | Gestion / visualisation des statuts |
| /team | Gestion de l’équipe |
| /affilies | Module d’affiliation |
| /integrations/shopify | Intégration Shopify |
| /sources/google-sheets | Intégration Google Sheets |
| /settings | Paramètres |
| /help | Aide |

---

## 9. Principaux modules métier

### Dashboard
Le dashboard centralise les KPI, les revenus, les indicateurs de performance, les taux de confirmation et les statistiques globales liées aux commandes.

### Commandes
Le module commandes constitue le cœur métier du frontend. Il couvre notamment :

- la consultation des commandes ;
- les commandes abandonnées ;
- le détail d’une commande ;
- les informations client ;
- les produits commandés ;
- le suivi du statut et de l’historique.

### Clients
Le module clients permet la consultation, la recherche et le tri des clients ainsi que l’affichage de certaines métriques globales.

### Produits
Le module produits couvre la gestion du catalogue, la recherche, l’édition, les variantes et certains champs liés à Shopify.

### Companies
Ce module permet de connecter et configurer les sociétés de livraison / carriers.

### Shipments
Le module expéditions couvre le suivi logistique, les statuts d’expédition et les actions associées.

### Team
Le module équipe permet la gestion des membres, de certains paramètres d’organisation, ainsi que de réglages liés au dispatch ou aux commissions.

### Settings
Le module paramètres couvre le profil utilisateur, la sécurité, le changement de mot de passe et certains réglages métier.

---

## 10. Couche API

Le frontend n’utilise pas une seule stratégie d’accès API.
On retrouve actuellement :

- des services dédiés (authService.js, teamService.js, companiesService.js, shipmentsService.js) ;
- des appels directs via le client Axios partagé ;
- dans certains cas, des appels fetch() écrits directement dans les pages.

Cette hétérogénéité est un point de dette technique à garder en tête lors de la reprise.

---

## 11. Points importants pour la reprise

### 1. Le module commandes est prioritaire
Le module commandes est le plus central du frontend.
Il faut lire en priorité :

- Orders.jsx
- OrderDetails.jsx
- AbandonedOrders.jsx
- éventuellement les variantes comme AdminOrders.jsx ou AgentOrders.jsx si elles sont encore utilisées

### 2. Certaines pages semblent présentes mais non routées
Des pages comme :

- ShipmentsPage.jsx
- ShipmentDetailsPage.jsx

semblent exister dans le code mais ne figurent pas dans la configuration principale des routes.
Ce point doit être vérifié avant toute évolution du module expéditions.

### 3. Certaines pages portent beaucoup de logique métier
Les pages suivantes sont particulièrement importantes :

- Dashboard.jsx
- Orders.jsx
- OrderDetails.jsx
- Products.jsx
- Team.jsx
- Parametre.jsx

### 4. La couche API n’est pas homogène
Le frontend mélange services dédiés, appels directs Axios et parfois fetch().
Toute refactorisation future devrait tendre vers une stratégie plus cohérente.

---

## 12. Ordre recommandé de lecture pour une nouvelle développeuse

### Étape 1 — Structure globale
Lire d’abord :

- main.jsx
- AppRoutes.jsx
- ProtectedRoute.jsx
- DashboardLayout.jsx
- Sidebar.jsx
- Navbar.jsx

### Étape 2 — Authentification et contexte global
Puis :

- AuthContext.jsx
- ThemeContext.jsx
- LanguageContext.jsx
- ShopContext.jsx
- authService.js

### Étape 3 — Couche API
Ensuite :

- axios.js
- teamService.js
- companiesService.js
- shipmentsService.js

### Étape 4 — Pages métier prioritaires
Enfin :

- Dashboard.jsx
- Orders.jsx
- OrderDetails.jsx
- Products.jsx
- CompaniesPage.jsx
- Team.jsx
- Parametre.jsx
- ShopifyIntegrationPage.jsx

---

## 13. Points à compléter dans la documentation

Pour une passation plus complète, cette documentation peut être enrichie par :

- un tableau détaillé page par page ;
- une cartographie des composants métier importants ;
- une documentation backend associée ;
- une liste des bugs connus, TODO et priorités de reprise.

---

## 14. Conclusion

Ce README sert de point d’entrée pour comprendre rapidement le frontend et préparer une reprise du projet dans de bonnes conditions.
Il ne remplace pas une lecture ciblée du code, mais permet d’identifier plus vite :

- l’architecture globale ;
- les pages les plus importantes ;
- les fichiers structurants ;
- les modules métier sensibles ;
- les principaux points de dette technique.