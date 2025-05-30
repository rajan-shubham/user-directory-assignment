import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const GET_ALL_USERS = gql`
  query GetAllUsers {
    allUsers {
      id
      name
      email
      role
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($name: String!, $email: String!, $role: String!) {
    createUser(name: $name, email: $email, role: $role) {
      user {
        id
        name
        email
        role
      }
      ok
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $role: String) {
    updateUser(id: $id, name: $name, email: $email, role: $role) {
      user {
        id
        name
        email
        role
      }
      ok
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  constructor(private apollo: Apollo) { }

  getAllUsers(): Observable<User[]> {
    return this.apollo.watchQuery<{ allUsers: User[] }>({
      query: GET_ALL_USERS
    }).valueChanges.pipe(
      map(result => result.data.allUsers)
    );
  }

  createUser(name: string, email: string, role: string): Observable<{ user: User, ok: boolean }> {
    return this.apollo.mutate<{ createUser: { user: User, ok: boolean } }>({
      mutation: CREATE_USER,
      variables: { name, email, role },
      refetchQueries: [{ query: GET_ALL_USERS }] // Refetch users after creation
    }).pipe(
      map(result => result.data!.createUser)
    );
  }

  updateUser(id: string, name?: string, email?: string, role?: string): Observable<{ user: User, ok: boolean }> {
    return this.apollo.mutate<{ updateUser: { user: User, ok: boolean } }>({
      mutation: UPDATE_USER,
      variables: { id, name, email, role },
      refetchQueries: [{ query: GET_ALL_USERS }] // Refetch users after update
    }).pipe(
      map(result => result.data!.updateUser)
    );
  }
}
