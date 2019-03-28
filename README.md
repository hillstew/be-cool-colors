# Kewl Kolorz API
---
Through this RESTful API, users can **GET**, **POST**, **PUT**, and **DELETE** project and associated palette information.

### View [Live](https://fe-cool-colors.herokuapp.com/)

### View [Front-End Repository](http://frontend.turing.io/projects/palette-picker.html)
---
#### Base URL

This base URL is to be used for all requests:
`https://be-cool-colors.herokuapp.com`

---
### GET

Kewl Kolorz has four GET endpoints: two for projects, and two for palettes.

#### 1. GET `/api/v1/projects`

This endpoint will return all of your saved projects.

**Example response to request `/api/v1/projects`:**

```
[
  {
    "id": 1,
    "name": "SWAPIbox",
    "created_at": "2019-03-2717:41:32.73059-06",
    "updated_at": "2019-03-2717:41:32.73059-06"
  },
  {
    "id": 2,
    "name": "Palette Picker",
    "created_at": "2019-03-2717:41:32.73059-06",
    "updated_at": "2019-03-2717:41:32.73059-06"
  }
]
```

**Optional query parameter: `?name=nameValue`**
This endpoint with a query parameter will search through all projects and returns the project which that matches the name given as the nameValue.

**Example response to request `/api/v1/projects?name=SWAPIbox`:**

```
[
  {
    "id": 1,
    "name": "SWAPIbox",
    "created_at": "2019-03-2717:41:32.73059-06",
    "updated_at": "2019-03-2717:41:32.73059-06"
  }
]
```

#### 2. GET `/api/v1/projects/:id`

This endpoint will return the specific project that matches the id parameter.

**Example response to request `/api/v1/projects/2`:**

```
{
  "id": 2,
  "name": "SWAPIbox",
  "created_at": "2019-03-2717:41:32.73059-06",
  "updated_at": "2019-03-2717:41:32.73059-06"
}
```

### 3. GET `/api/v1/palettes/:id`

This endpoint will return a specific palette that matches the id parameter

**Example response to request `/api/v1/palettes/2`:**

```
{
  "id": 1,
  "name": "Space Palette",
  "color_1": "#000000",
  "color_2": "#000000",
  "color_3": "#000000",
  "color_4": "#000000",
  "color_5": "#000000",
  "project_id": 2,
  "created_at": "2019-03-2717:41:32.73059-06",
  "updated_at": "2019-03-2717:41:32.73059-06"
}
```

#### 4. GET `/api/v1/projects/:id/palettes`

This endpoint searches the saved projects for the given id, and then returns all palettes for that particular project.

**Example response to request `/api/v1/projects/2/palettes`:**

```
[
  {
    "id": 1,
    "name": "Space Palette",
    "color_1": "#000000",
    "color_2": "#000000",
    "color_3": "#000000",
    "color_4": "#000000",
    "color_5": "#000000",
    "project_id": 2,
    "created_at": "2019-03-2717:41:32.73059-06",
    "updated_at": "2019-03-2717:41:32.73059-06"
  },
  {
    "id": 5,
    "name": "Planets Palette",
    "color_1": "#000000",
    "color_2": "#000000",
    "color_3": "#000000",
    "color_4": "#000000",
    "color_5": "#000000",
    "project_id": 2,
    "created_at": "2019-03-2717:41:32.73059-06",
    "updated_at": "2019-03-2717:41:32.73059-06"
  }
]
```

---
### POST

Kewl Kolorz has two POST endpoints: one for projects, and one for palettes. These endpoints return the ID of the project or palette that was created.

#### 1. POST `api/v1/projects`

This POST endpoint saves a new project. All that is needed is the name of the project. Each project name must be unique: for example, only one SWAPIbox project may exist in this database.

**Request body requirements:**

| Key  | Data Type | Details           |
| ---- | --------- | ----------------- |
| name | string    | Your project name |

**Example request body to `api/v1/projects`:**

```
{
  name: 'Whateverly'
}
```

**Example response:**

```
{
  id: '6'
}
```

#### 2. POST `api/v1/palettes`

This POST endpoint saves a new palette. It requires the name of the palette, the 5 colors of the palette, and the associated project id.

**Request body requirements:**


| Key          | Data Type | Details                                                             |
| ------------ | --------- | ------------------------------------------------------------------- |
| name       | string  | Your palette name                                                 |
| color_1    | string  | 6 character hex code                                                |
| color_2    | string  | 6 character hex code                                                |
| color_3    | string  | 6 character hex code                                                |
| color_4    | string  | 6 character hex code                                                |
| color_5    | string  | 6 character hex code                                                |
| project_id | integer | ID of Project that the palette belongs to - used as the foreign key |

**Example request body to `api/v1/palettes`:**

```
{
  "name": "Galaxy GETAWAY",
  "color_1": "#000000",
  "color_2": "#000000",
  "color_3": "#000000",
  "color_4": "#000000",
  "color_5": "#000000",
  "project_id": 2
}
```

**Example response:**

```
{
  id: '10'
}
```

---
### PUT

Kewl Kolorz has two PUT endpoints: one to to update a palette, one to update a project. 

#### 1. PUT `api/v1/projects/:id`

This PUT endpoint finds the project that matches the id parameter and replaces that project.

**Request body requirements:**

| Key   | Data Type     | Details                |
| ----- | ------------- | ---------------------- |
| name  | string        | Edited project name    |

**Example request body to `api/v1/projects/1`:**

```
{
  name: 'CrossPol Project'
}
```

#### 2. PUT `api/v1/palettes/:id`

This PUT endpoint finds the palette that matches the id parameter and replaces that palette.

**Request body requirements:**
> Reminder: any of these details could be the edited part of the palette.

| Key          | Data Type | Details                                                             |
| ------------ | --------- | ------------------------------------------------------------------- |
| name       | string  | Your palette name                                                   |
| color_1    | string  | 6 character hex code                                                |
| color_2    | string  | 6 character hex code                                                |
| color_3    | string  | 6 character hex code                                                |
| color_4    | string  | 6 character hex code                                                |
| color_5    | string  | 6 character hex code                                                |
| project_id | integer | ID of Project that the palette belongs to - used as the foreign key |

**Example request body to `api/v1/palettes/3`:**

```
{
  "name": "Better Palette",
  "color_1": "#000000",
  "color_2": "#000000",
  "color_3": "#000000",
  "color_4": "#000000",
  "color_5": "#000000",
  "project_id": 1
}
```

---
### DELETE

Kewl Kolorz has two DELETE endpoints, one to delete a project (and it's associated palettes), and one to delete a palette.
If a project or palette with the given id is not found, these endpoints return a status of ```404```.

#### 1. DELETE `api/v1/projects/:id`

This DELETE endpoint will delete the single project that matches the id parameter.
When successfully deleted, it returns a message of: 
``` Success! Your project with the id [id] has been deleted. ``` 

#### 2. DELETE `api/v1/palettes/:id`

This DELETE endpoint will delete the single palette that matches the id parameter.
``` Success! Your palette with the id [id] has been deleted. ``` 