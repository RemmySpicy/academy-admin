# **Elitesgen Academy Management System \- Optimized PRD**

## **Executive Summary**

A comprehensive multi-program academy management platform designed to digitize and streamline operations for Elitesgen Academy's year-round sports programs. The system consists of three interconnected applications with API-based communication, developed in sequence: Admin Dashboard → Parent App → Instructor App.

**Target Scale**: Up to 1,000 students within first year across multiple existing locations **Development Approach**: Building the "perfect system" with comprehensive features from day one **Technical Strategy**: API-first architecture with simultaneous dashboard development

## **System Architecture Overview**

### **Development Sequence**

1. **Admin Dashboard** \- Web-based management interface (desktop-optimized)  
2. **Parent/Student App** \- Mobile app for enrollment, scheduling, and progress tracking  
3. **Instructor/Coordinator App** \- Mobile app for lesson delivery and assessment (offline-capable)

### **API Architecture**

* **Central Academy API** \- Core data management serving all applications  
* **Basic Zoho Books Integration** \- Essential payment status tracking  
* **Multi-Location Data Management** \- Facility-specific operations with consolidated oversight

## **Core Data Model & Relationships**

### **Student Profile Structure**

* **Basic Information**: Salutation, first name, last name, email, phone, date of birth, referral source, address (country, state, city, full address)  
* **Academy Assignment**: Activity/sport, course, facility assignment, instructor assignment  
* **Progression Tracking**: Current curriculum level and module, star ratings (0-3), achievement milestones  
* **Attendance Tracking**: Session-by-session attendance with detailed session information  
* **Payment Integration**: Basic transaction status from Zoho Books (Paid, Sent, Overdue)  
* **Schedule Management**: Session scheduling with status (Upcoming, Completed, Cancelled)

### **Parent/Guardian Profile Structure**

* **Basic Information**: Name, phone, email, assigned facilities  
* **Multi-Child Management**: One parent manages multiple students, consolidated financial and schedule oversight  
* **Session Credits**: Tracking of remaining sessions per child  
* **Consolidated Views**: Financial overview and schedule management across all children

### **Instructor Profile Structure**

* **Basic Information**: Name, contact details, assigned facilities  
* **Multi-Program Specializations**: Sports/programs they can teach  
* **Availability Management**: Schedule and conflict prevention  
* **Student Assignment**: Manual assignment by admins

### **Enhanced Curriculum Hierarchy**

Program (Swimming, Football, Basketball, etc.)  
├── Course (e.g., Swimming Club, Adult Swimming, Survival Swimming)  
    ├── Curriculum (Age Group Based \- e.g., Swimming Club: 3-5, Swimming Club: 6-18)  
        ├── Level (e.g., Level 1, Level 2, Level 3\)  
            ├── Equipment Requirements  
            ├── Assessment Rubric Package (0-3 star rating system)  
            ├── Module (e.g., Module 1, Module 2\)  
                ├── Section (e.g., Section 1: Introduction to Frog Kick)  
                    ├── Lesson Content  
                        ├── Title & Description  
                        ├── Instructor Delivery Guidelines  
                        ├── Lesson ID (e.g., L101, L102)  
                        ├── Difficulty Level  
                        ├── Media Links (video/document references)

### **Business Rules & Operational Logic**

* **Multi-Location Operations**: Full support from launch with facility-specific data management  
* **Assessment System**: Complete 0-3 star rating system with detailed rubrics  
* **Parent-Child Relationships**: One parent manages multiple students, one student has one parent  
* **Session Capacity**: Group sessions (5 students max), Private sessions (2 students max), School sessions (higher capacity)  
* **Schedule Management**: 1-hour sessions with recurring and one-time options  
* **Instructor Assignment**: Manual assignment by admins with availability conflict prevention  
* **Admin Authority**: Super Admin override capabilities for all enrollment and scheduling rules

## **MVP Feature Set \- Complete System**

### **Admin Dashboard (Phase 1\)**

#### **Core Management Features**

**Program Management (Super Admin)**

* Create/edit programs with global program context switching  
* Assign Program Admins to multiple programs  
* Multi-location/facility management from launch

**Complete Curriculum Management**

* Full hierarchical curriculum builder (7-level deep structure)  
* Equipment requirements per level  
* Assessment rubric creation (0-3 star system)  
* Video link embedding for lessons  
* Content library management

**Advanced Schedule Management**

* Comprehensive scheduling interface with modal and tabbed patterns  
* Schedule status management (Upcoming, Completed, Cancelled)  
* Session types: Group and private lessons with participant management  
* Booking management with availability tracking  
* One-time and recurring session options  
* Cross-participant scheduling coordination  
* Schedule conflict prevention and resolution

**Comprehensive Student/Parent Management**

* **Student Management**: Complete profiles with tabbed interface (Profile, Progress, Attendance, Transactions, Schedule)  
* **Parent Management**: User profiles with multi-child oversight (Profile, Children, Transactions, Schedules)  
* **Advanced Features**: Manual instructor assignment, course enrollment, progression tracking  
* **Family Management**: Parent-child relationship linking, consolidated financial tracking  
* **Session Management**: Individual and bulk schedule modifications, booking with availability tracking

**Essential Integrations**

* **Basic Zoho Books Integration**: Payment status tracking (Paid, Sent, Overdue)  
* **Multi-Location Support**: Facility-specific operations with student transfer capability

### **Parent/Student App (Phase 2\)**

* Complete enrollment management  
* Schedule selection and booking  
* Progress tracking and assessment results  
* Family account management  
* Payment status viewing  
* Multi-child management for parents

### **Instructor/Coordinator App (Phase 3\)**

* Complete curriculum delivery access  
* Assessment scoring with 0-3 star system  
* Progress reporting and submission  
* Student attendance tracking  
* Offline capability for lesson delivery

## **Technical Architecture**

### **API-First Development Strategy**

* **Core Academy API**: Built alongside admin dashboard  
* **Standardized Endpoints**: RESTful API design for consistent mobile app integration  
* **Multi-Location Data Architecture**: Facility-specific data segregation with consolidated reporting  
* **Authentication System**: Role-based access (Super Admin, Program Admin)

### **Database Schema Priorities**

* **Multi-Location Support**: Facility-specific data management from launch  
* **Complex Curriculum Hierarchy**: 7-level deep structure support  
* **Assessment System**: 0-3 star rating with detailed rubric storage  
* **Family Relationship Management**: Parent-child linking with consolidated oversight  
* **Schedule Conflict Prevention**: Instructor availability and session capacity management  
* **Session Credit Tracking**: Flexible session management per student

## **System Design Standards**

### **Desktop-Optimized Interface (Admin Dashboard)**

* **Layout**: Fixed sidebar navigation with hierarchical menu structure  
* **Data Management**: Comprehensive data tables with search, filter, and sort capabilities  
* **Modal Windows**: Full-screen overlays for detailed entity management  
* **Tabbed Interfaces**: Profile, Progress, Attendance, Transactions, Schedule organization  
* **Status Indicators**: Color-coded system for all operational states

### **Mobile-First Design (Parent & Instructor Apps)**

* **Responsive Design**: Optimized for mobile devices with touch-friendly interfaces  
* **Offline Capability**: Essential for instructor app lesson delivery  
* **Real-Time Sync**: Immediate data synchronization when online  
* **Intuitive Navigation**: Simple, role-specific interface design

## **Development Approach**

### **Phase 1: Admin Dashboard (Immediate Focus)**

**Core Features:**

* Complete program and curriculum management  
* Full student/parent management system  
* Advanced scheduling with conflict prevention  
* Multi-location support  
* Basic Zoho Books integration  
* Assessment rubric system (0-3 stars)

**Timeline**: Primary development focus until feature-complete

### **Phase 2: Parent/Student App**

**Core Features:**

* Student enrollment and course selection  
* Schedule management and booking  
* Progress tracking and assessment viewing  
* Family account management  
* Payment status integration

**Prerequisites**: Admin Dashboard APIs fully functional

### **Phase 3: Instructor/Coordinator App**

**Core Features:**

* Curriculum delivery and access  
* Assessment scoring and submission  
* Student attendance tracking  
* Offline lesson delivery capability

**Prerequisites**: Complete API ecosystem and content management

## **Technical Implementation**

### **Authentication & Security**

* Email/password authentication for admin users  
* Role-based access control (Super Admin, Program Admin)  
* Secure API endpoints for mobile app integration

### **Data Management**

* Manual data entry system for comprehensive setup  
* Multi-location data architecture from launch  
* No bulk import requirements for initial deployment  
* Scalable database design for 1,000+ students

### **Integration Requirements**

* **Zoho Books**: Basic payment status sync  
* **Multi-Location**: Facility-specific operations  
* **Mobile Apps**: API-first architecture for seamless integration

## **Success Criteria**

### **Admin Dashboard Success**

* Complete operational management of all academy programs  
* Efficient multi-location facility management  
* Comprehensive student and parent relationship tracking  
* Advanced scheduling with conflict prevention  
* Full curriculum and assessment management

### **Mobile App Success**

* Seamless parent/student enrollment and scheduling  
* Efficient instructor lesson delivery and assessment  
* Real-time data synchronization across all platforms  
* Offline capability for critical instructor functions

### **System Integration Success**

* API-first architecture supporting all three applications  
* Multi-location data management with consolidated oversight  
* Scalable architecture supporting growth to 1,000+ students  
* Comprehensive academy management replacing all current processes

## **Removed Features (Post-MVP)**

* Curriculum versioning system  
* Academy-wide communication/chat system  
* Advanced reporting and analytics  
* Waitlist management system  
* Bulk data import capabilities

---

**Development Philosophy**: Building the perfect system with comprehensive features from day one, ensuring each phase delivers a complete, functional solution that elevates academy operations to professional standards.

