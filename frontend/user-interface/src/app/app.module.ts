import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { APOLLO_OPTIONS, ApolloModule } from 'apollo-angular'; // Import ApolloModule and APOLLO_OPTIONS
import { HttpLink } from 'apollo-angular/http'; // Import HttpLink
import { InMemoryCache } from '@apollo/client/core';
import { UserListComponent } from './components/user-list/user-list.component'; // Import InMemoryCache

@NgModule({
  declarations: [
    AppComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule, // Add HttpClientModule here
    ApolloModule, // Add ApolloModule here
    ReactiveFormsModule // Add ReactiveFormsModule here
  ],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        return {
          cache: new InMemoryCache(),
          link: httpLink.create({
            uri: 'http://127.0.0.1:5000/graphql', // Your GraphQL endpoint
          }),
        };
      },
      deps: [HttpLink],
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
