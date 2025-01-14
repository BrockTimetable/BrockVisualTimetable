# API Documentation

This document provides an overview of the API endpoints available in this project, along with example requests and responses.

## Base Backend URL

All API requests are prefixed with the following base URL: https://api.brocktimetable.com


## Endpoints

### 1. Get List of All Course Names

**Endpoint:** `GET /api/getNameList`

**Description:** Retrieves a list of all course names and their durations being offered in a timetable session. 

#### Request

- **Method:** `GET`
- **URL:** `/api/getNameList`
- **Headers:**
  - `timetableType: <timeTableType>`
  - `session: <session>`

#### Example Request

```
curl "https://api.brocktimetable.com/api/getNameList?timetableType=UG&session=FW"
```

#### Example Response

```
[ABED 4F84 D2", "ABED 4F85 D3", "ABTE 8P85 D3", "ABTE 8P90 D3", ...]
```

### 2. Get Course Data

**Endpoint:** `GET /api/getCourse`

**Description:** Retrieves course specific data. 

#### Request

- **Method:** `GET`
- **URL:** `/api/getCourse`
- **Headers:**
-  `courseCode: <courseCode>`
  - `timetableType: <timeTableType>`
  - `session: <session>`

#### Example Request

```
curl "https://api.brocktimetable.com/api/getCourse?courseCode=COSC1P02&timetableType=UG&session=FW"
```

#### Example Response

```
{
  "courseCode": "COSC1P02",
  "sections": [
    {
      "id": "3591101",
      "schedule": {
        "duration": "2",
        "days": "W F",
        "time": "1400-1530",
        "startDate": "1725422400",
        "endDate": "1733202000"
      },
      "type": "LEC",
      "sectionNumber": "1",
      "instructor": "Foxwell, Earl"
    }
  ],
  "labs": [
    {
      "id": "3591401",
      "schedule": {
        "duration": "2",
        "days": "W",
        "time": "1000-1200",
        "startDate": "1725422400",
        "endDate": "1733202000"
      },
      "type": "LAB",
      "sectionNumber": "1"
    }
  ],
  "tutorials": [
    {
      "id": "3591501",
      "schedule": {
        "duration": "2",
        "days": "W",
        "time": "1200-1300",
        "startDate": "1725422400",
        "endDate": "1733202000"
      },
      "type": "TUT",
      "sectionNumber": "1"
    }
  ],
  "seminars": []
}

```
### 3. Get Date of Data Update

**Endpoint:** `GET /api/dataAge`

**Description:** Retrieves a timestamp of when the data for the timetable & session was last updated.

#### Request

- **Method:** `GET`
- **URL:** `/api/dataAge`
- **Headers:**
  - `timetableType: <timeTableType>`
  - `session: <session>`

#### Example Request

```
curl "https://api.brocktimetable.com/api/dataAge?timetableType=UG&session=FW"
```

#### Example Response

```
{"dataAge":"9/13/2024, 10:27:00 AM"}
```
