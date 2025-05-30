import graphene
from flask import Flask
from flask_graphql import GraphQLView
from flask_cors import CORS # Import CORS
from pymongo import MongoClient, ReturnDocument
from bson.objectid import ObjectId

# MongoDB Setup
client = MongoClient('mongodb+srv://shubhamrajan:PgHhCpP8RI4a3klV@devMeet.su8vc.mongodb.net/user_directory_db')
db = client.user_directory_db
users_collection = db.users

class User(graphene.ObjectType):
    id = graphene.ID(required=True)
    name = graphene.String(required=True)
    email = graphene.String(required=True)
    role = graphene.String(required=True)

class Query(graphene.ObjectType):
    all_users = graphene.List(User)
    user_by_id = graphene.Field(User, id=graphene.ID(required=True))

    def resolve_all_users(root, info):
        all_db_users = users_collection.find()
        return [User(id=str(u['_id']), name=u['name'], email=u['email'], role=u['role']) for u in all_db_users]

    def resolve_user_by_id(root, info, id):
        try:
            user_doc = users_collection.find_one({"_id": ObjectId(id)})
        except Exception: # Handles invalid ObjectId format
            return None
        if user_doc:
            return User(id=str(user_doc['_id']), name=user_doc['name'], email=user_doc['email'], role=user_doc['role'])
        return None

class CreateUser(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        email = graphene.String(required=True)
        role = graphene.String(required=True)

    user = graphene.Field(User)
    ok = graphene.Boolean()

    def mutate(root, info, name, email, role):
        new_user_data = {
            "name": name,
            "email": email,
            "role": role
        }
        result = users_collection.insert_one(new_user_data)
        created_user_doc = users_collection.find_one({"_id": result.inserted_id})
        if created_user_doc:
            return CreateUser(user=User(id=str(created_user_doc['_id']), name=created_user_doc['name'], email=created_user_doc['email'], role=created_user_doc['role']), ok=True)
        return CreateUser(user=None, ok=False)

class UpdateUser(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        email = graphene.String()
        role = graphene.String()

    user = graphene.Field(User)
    ok = graphene.Boolean()

    def mutate(root, info, id, name=None, email=None, role=None):
        update_fields = {}
        if name is not None:
            update_fields['name'] = name
        if email is not None:
            update_fields['email'] = email
        if role is not None:
            update_fields['role'] = role

        if not update_fields:
            # If no fields to update, find and return the existing user or None
            try:
                existing_user_doc = users_collection.find_one({"_id": ObjectId(id)})
            except Exception:
                 return UpdateUser(user=None, ok=False) # Invalid ID format
            if existing_user_doc:
                 return UpdateUser(user=User(id=str(existing_user_doc['_id']), name=existing_user_doc['name'], email=existing_user_doc['email'], role=existing_user_doc['role']), ok=True)
            return UpdateUser(user=None, ok=False)

        try:
            updated_user_doc = users_collection.find_one_and_update(
                {"_id": ObjectId(id)},
                {"$set": update_fields},
                return_document=ReturnDocument.AFTER
            )
        except Exception: # Handles invalid ObjectId format
            return UpdateUser(user=None, ok=False)

        if updated_user_doc:
            return UpdateUser(user=User(id=str(updated_user_doc['_id']), name=updated_user_doc['name'], email=updated_user_doc['email'], role=updated_user_doc['role']), ok=True)
        return UpdateUser(user=None, ok=False)

class Mutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    update_user = UpdateUser.Field()

schema = graphene.Schema(query=Query, mutation=Mutation)

app = Flask(__name__)
CORS(app, resources={r"/graphql": {"origins": "http://localhost:4200"}})
 # Enable CORS for all routes and origins by default

app.add_url_rule(
    '/graphql',
    view_func=GraphQLView.as_view(
        'graphql',
        schema=schema,
        graphiql=True  # for an interactive browser IDE
    )
)

if __name__ == '__main__':
    # Note: Dummy data is no longer added here as data is persisted in MongoDB.
    # You can add initial data directly to your MongoDB collection if needed.
    app.run(debug=True, port=5000)