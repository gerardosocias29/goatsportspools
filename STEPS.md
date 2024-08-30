# GitHub Update Instructions

## 1. Making Changes Locally

### Clone the Repository (if not already cloned)

```
git clone git@github.com:gerardosocias29/goatsportspools.git
git clone git@github.com:gerardosocias29/goatsportspools-backend.git
```

### Navigate to the Project Directory

- For the frontend:
  ```
  cd goatsportspools
  ```
- For the backend:
  ```
  cd goatsportspools-backend
  ```

### Make Your Code Changes

- Edit the files as needed using your preferred code editor.

### Stage Your Changes

```
git add .
```

### Commit Your Changes

```
git commit -m "Describe your changes here"
```

### Push Your Changes to GitHub

```
git push origin main
```

## 2. Accessing the Server

After pushing your changes, log in to the server where the project is hosted.

### Connect to the Server Using SSH

```
ssh -p 65002 u574340141@149.100.151.82
```

- Enter the password: `Chiefs2#`

## 3. Update the Server

### Navigate to the Project Directory on the Server

```
cd public_html
```

### Pull the Latest Changes

```
git fetch
git merge origin/main
```

### Build the Project

```
npm run build
```

## 4. Testing the Goatsportspools

To test the frontend and backend on the server:

### Navigate to the Frontend Directory

```
cd test-goatsportspools-frontend
```

### Pull the Latest Changes for Frontend

```
git fetch
git merge origin/main
```

### Build the Frontend Project

```
npm run build
```

### Navigate to the Backend Directory

```
cd ../test-goatsportspools-backend
```

### Pull the Latest Changes for Backend

```
git pull
```