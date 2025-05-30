import { Component, OnInit } from '@angular/core';
import { GraphqlService, User } from '../../services/graphql.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Import reactive forms modules

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  userForm: FormGroup;
  editingUser: User | null = null; // To track which user is being edited

  constructor(private graphqlService: GraphqlService, private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.graphqlService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    const { name, email, role } = this.userForm.value;

    if (this.editingUser) {
      // Update existing user
      this.graphqlService.updateUser(this.editingUser.id, name, email, role).subscribe(() => {
        this.loadUsers(); // Reload users after update
        this.cancelEdit(); // Reset form and editing state
      });
    } else {
      // Create new user
      this.graphqlService.createUser(name, email, role).subscribe(() => {
        this.loadUsers(); // Reload users after creation
        this.userForm.reset(); // Reset form
      });
    }
  }

  editUser(user: User): void {
    this.editingUser = user;
    this.userForm.patchValue({
      name: user.name,
      email: user.email,
      role: user.role
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.userForm.reset();
  }
}
