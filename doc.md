1 | P a g e
Business Process – Modelling & Design
Department of Computing
Web Design and Development
Business Processes - Modelling & Design
Assignment: Conceptualising the Problem Solution
Due: 02nd March 2026
Group: 2(TUESDAY)
Project Title: LOCAL BUSINESS VISIBILITY
Instructions
a) This document acts as a reference or template to aid you in the design and development of web products based on the
proposed problem ideas.
b) Fill in the respective sections with all necessary contents based on your group project ideas. Submit via Google
Classroom as a soft copy and hand in a printed hard copy. A single submission is expected per group.
c) Any form of plagiarism will attract severe penalties. All rules of academic writing apply.
d) Any other document format other than what is contained and specified herein will NOT be assessed. This cover page
must not overflow to the next page.
2 | P a g e
Business Process – Modelling & Design
Group Members
# Registration Number Name (as indicated on the portal) Score Score Score
1 BSC/COM/04/24 REGINA NAZOMBE
2 EFP/BSC/INF/02/24 JOSEPHAT AKUZIKE JOACHIM
3 BSC/INF/24/24 FATEEMAH ABDULRASHEED
4 BED/COM/39/24 MOLLY GONDWE
5 BED/COM/48/24 HAUYA MAGRET
6
3 | P a g e
Business Process – Modelling & Design
Problem Definition
The problem being addressed is that many small and medium businesses are not easily recognized by the public, even
when they offer useful products and services. Because their details are not widely shared, potential customers may not
know they exist,where they are located, or how to contact them. This website aims to solve that visibility gap by collecting
business information such as the business name,contact details and other key information, then making it accessible to
the public in one place. In this way, the platform helps businesses reach more people, attract more customers, and
improve their chances of growth.
PROJECT GOALS/OBJECTS
To develop a website that collects and publishes business information in one accessible platform to improve visibility and
connect business with potential customers.
Roles/Users
Administrator- will handle logging in and eligibility of the business
Service provider- will provide the web services to theirs clients
Clients-providing its services to the customers
Customers- will purchase the service or product
Functional Requirements
User authentication
4 | P a g e
Business Process – Modelling & Design
-The system should allow the clients to create an accounts
-Allows clients and customers to log in
-Allow clients and users to log out
-Users should be able to reset their passwords
Notifications
-Should alert customers about new stock
-Should send notification to customers about clients
-Should send notifications about the customers preferences
-Should notify customers about available services in the area
Reservesations
-Booking appointments
-Taking orders
Search and discovery
-Users should be able to search for products
-Users should be able to search for a business using its name
-System should allow users to separate businesses by category and location
- Should allow the public to view businesses without logging in
Stock Management
-Should be able to add a new supply of Goods
-Should be able to Track sold Goods
-Should be able to add,remove and update services
REST ENDpoints
5 | P a g e
Business Process – Modelling & Design
Module Endpoint Method Description Request Body / Parameters
Auth /api/v1/auth/register POST Register a new
user
{
username,email,location,business
name, password }
/api/v1/auth/login POST Login user {email, password}
/api/v1/auth/logout POST Logout user –
Customers /api/v1/customers POST Create customer { username, email,location ... }
/api/v1/customers GET List of customers Query parameters
/api/v1/customers/:id GET Get customer
details
Path: id
/api/v1/customers/:id PUT Update customer { ... }
/api/v1/customers/:id DELETE Delete customer Path: id
/api/v1/customer/notification GET View notification
/api/v1/client/notification/:id PUT Mark as read Path:id
/api/v1/customers/:id/reservations GET Get reservations –
Admin /api/v1/admin/users GET Get all users _
/api/v1/admin/business GET Get all businesses _
/api/v1/admin/business/:id DELETE Remove business Path: id
Client /api/v1/client/business POST Create business
profile
{name,description,category,locatin,contact}
6 | P a g e
Business Process – Modelling & Design
/api/v1/client/business GET Get business
details
/api/v1/client/business/: id PUT Update business {name,description}
/api/v1/client/business/:id DELETE Delete business Path: id
/api/v1/client/business/:id/images POST Upload business
images
Image file
/api/v1/client/business/:id/images GET Get all images Path:id
/api/v1/client/images/:imageid DELETE Delete image Path:imageid
/api/v1/client/notification GET View notification
/api/v1/client/notification/:id PUT Mark
notifications as
read
Path :id