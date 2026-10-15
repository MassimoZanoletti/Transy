import {Routes} from '@angular/router';
import {LoginPageComponent} from './pages/login-page/login-page.component';
import {MainPageComponent} from './pages/main-page/main-page.component';
import {SettingsPageComponent} from './pages/settings-page/settings-page.component';
import {AdminGuard, AuthGuard, NoAllenatoreGuard} from './auth.guard';
import {SeasonsTableComponent} from "./tables/seasons-table/seasons-table.component";
import {SeasonEditComponent} from "./forms/season-edit/season-edit.component";
import {SocietaTableComponent} from "./tables/societa-table/societa-table.component";
import {SocietaEditComponent} from "./forms/societa-edit/societa-edit.component";
import {UsersTableComponent} from "./tables/users-table/users-table.component";
import {UserEditComponent} from "./forms/user-edit/user-edit.component";
import {LogTableComponent} from "./tables/log-table/log-table.component";
import {DatabaseComponent} from "./pages/database/database.component";
import {ChampEditComponent} from "./forms/champ-edit/champ-edit.component";
import {PhaseEditComponent} from "./forms/phase-edit/phase-edit.component";
import {TeamEditComponent} from "./forms/team-edit/team-edit.component";
import {MatchComponent} from "./pages/match/match.component";
import {StatCampionatoPageComponent} from "./pages/stat-campionato-page/stat-campionato-page.component";
import {InfoPageComponent} from "./pages/info-page/info-page.component";
import {GuidaStatistichePageComponent} from "./pages/guida-statistiche-page/guida-statistiche-page.component";


export const routes: Routes = [
   { path: 'login', component: LoginPageComponent },

   // Rotte protette (richiedono login)
   { path: '', component: MainPageComponent, canActivate: [AuthGuard] },
   { path: 'settings', component: SettingsPageComponent, canActivate: [AuthGuard] },
   { path: 'seasonstable', component: SeasonsTableComponent, canActivate: [AuthGuard] },
   { path: 'seasonedit', component: SeasonEditComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'societatable', component: SocietaTableComponent, canActivate: [AuthGuard] },
   { path: 'societaedit', component: SocietaEditComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'userstable', component: UsersTableComponent, canActivate: [AuthGuard] },
   { path: 'useraedit', component: UserEditComponent, canActivate: [AuthGuard] },
   { path: 'logtable', component: LogTableComponent, canActivate: [AuthGuard, AdminGuard] },
   { path: 'database', component: DatabaseComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'champedit', component: ChampEditComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'phaseedit', component: PhaseEditComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'teamedit', component: TeamEditComponent, canActivate: [AuthGuard, NoAllenatoreGuard] },
   { path: 'match', component: MatchComponent, canActivate: [AuthGuard] },
   { path: 'statcampionato', component: StatCampionatoPageComponent, canActivate: [AuthGuard] },
   { path: 'info', component: InfoPageComponent, canActivate: [AuthGuard] },
   { path: 'guida-statistiche', component: GuidaStatistichePageComponent, canActivate: [AuthGuard] },

   // Questa rotta dovrebbe essere l'ULTIMA.
   // Reindirizza a 'login' per qualsiasi URL che non matcha le rotte precedenti.
   { path: '**', redirectTo: 'login' }
];

