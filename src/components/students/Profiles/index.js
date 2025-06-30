import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ChevronLeft, 
  Save, 
  User, 
  Users, 
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Flag,
  AlertTriangle,
  Camera
} from 'lucide-react';

const ProfileContainer = styled.div`
  padding: 20px 0;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 15px;
  color: #718096;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  
  &:hover {
    color: #4a5568;
    background-color: #f7fafc;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #6c5ce7;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #5a4acf;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
`;

const Tab = styled.button`
  padding: 12px 16px;
  font-size: 15px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#6c5ce7' : 'transparent'};
  color: ${props => props.active ? '#6c5ce7' : '#718096'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: #6c5ce7;
  }
`;

const ProfileCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
  margin-bottom: 24px;
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  
  .title {
    font-size: 18px;
    font-weight: 600;
    color: #2d3748;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 8px;
  }
  
  input, select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 15px;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #6c5ce7;
    }
  }
`;

const PhotoUpload = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  
  .profile-image {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #6c5ce7;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 600;
    
    .edit-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      
      &:hover {
        opacity: 1;
      }
    }
  }
  
  .upload-info {
    display: flex;
    flex-direction: column;
    
    .title {
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .subtitle {
      font-size: 13px;
      color: #718096;
    }
  }
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 22px;
    margin-right: 8px;
    
    input {
      opacity: 0;
      width: 0;
      height: 0;
      
      &:checked + .slider {
        background-color: #6c5ce7;
      }
      
      &:checked + .slider:before {
        transform: translateX(20px);
      }
    }
    
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e2e8f0;
      transition: .3s;
      border-radius: 34px;
      
      &:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 2px;
        background-color: white;
        transition: .3s;
        border-radius: 50%;
      }
    }
  }
  
  .switch-label {
    font-size: 14px;
    font-weight: 500;
  }
`;

const EmergencyContact = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 12px;
  
  .contact-info {
    display: flex;
    flex-direction: column;
    
    .name {
      font-weight: 500;
      margin-bottom: 2px;
    }
    
    .relation {
      font-size: 13px;
      color: #718096;
    }
  }
  
  .contact-actions {
    display: flex;
    gap: 8px;
    
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: none;
      background: none;
      color: #718096;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f0f0f0;
        color: #4a5568;
      }
    }
  }
`;

const CourseDetailsSection = styled.div`
  margin-bottom: 20px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
  }
`;

const CourseFields = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
`;

// Mock student data
const mockStudent = {
  id: 1,
  firstName: 'Adebesi',
  lastName: 'Oluchi',
  email: 'adebisi@email.com',
  phone: '09864455677',
  dateOfBirth: '2024-01-06',
  salutation: 'Mr.',
  address: '12th March, 2002',
  city: 'Lagos',
  state: 'Lagos',
  country: 'Nigeria',
  referral: 'Miss. Olabode Esther',
  activity: 'Swimming',
  course: 'Adult swimming',
  facility: 'Ziggies Lifestyle Arena, Magodo',
  instructor: 'Coach Debby',
  emergencyContacts: [
    { 
      id: 1, 
      name: 'Mrs Olusesan Isaac', 
      relationship: 'Parent',
      phone: '08012345678'
    }
  ],
  medicalInformation: {
    hasAllergies: false,
    allergies: '',
    hasMedicalConditions: false,
    medicalConditions: '',
    medications: ''
  }
};

const StudentProfiles = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    // In a real app, fetch student data from API
    setStudent(mockStudent);
    setFormData(mockStudent);
  }, [studentId]);
  
  if (!student) {
    return <div>Loading student profile...</div>;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = () => {
    console.log("Updated student data:", formData);
    // In a real app, save changes to API
  };
  
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };
  
  return (
    <ProfileContainer>
      <HeaderSection>
        <div className="left">
          <BackButton onClick={() => navigate('/students')}>
            <ChevronLeft size={16} />
            Back to students
          </BackButton>
          <h1>{student.firstName} {student.lastName}</h1>
        </div>
        <SaveButton onClick={handleSubmit}>
          <Save size={16} />
          Save Changes
        </SaveButton>
      </HeaderSection>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'profile'} 
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </Tab>
        <Tab 
          active={activeTab === 'children'} 
          onClick={() => setActiveTab('children')}
        >
          Children
        </Tab>
        <Tab 
          active={activeTab === 'transactions'} 
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </Tab>
        <Tab 
          active={activeTab === 'schedules'} 
          onClick={() => setActiveTab('schedules')}
        >
          Schedules
        </Tab>
      </TabsContainer>
      
      {activeTab === 'profile' && (
        <>
          <ProfileCard>
            <ProfileHeader>
              <div className="title">Basic Information</div>
            </ProfileHeader>
            
            <PhotoUpload>
              <div className="profile-image">
                {getInitials(`${student.firstName} ${student.lastName}`)}
                <div className="edit-overlay">
                  <Camera size={24} />
                </div>
              </div>
              <div className="upload-info">
                <div className="title">Profile Photo</div>
                <div className="subtitle">
                  JPG, GIF or PNG. Max size of 800K
                </div>
              </div>
            </PhotoUpload>
            
            <FormRow>
              <FormGroup>
                <label>Salutation</label>
                <select 
                  name="salutation" 
                  value={formData.salutation} 
                  onChange={handleChange}
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Miss">Miss</option>
                  <option value="Dr.">Dr.</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label>First name</label>
                <input 
                  type="text" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Last name</label>
                <input 
                  type="text" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Phone number</label>
                <input 
                  type="text" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Email address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <label>Date of birth</label>
                <input 
                  type="date" 
                  name="dateOfBirth" 
                  value={formData.dateOfBirth} 
                  onChange={handleChange}
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <label>Referral</label>
              <input 
                type="text" 
                name="referral" 
                value={formData.referral} 
                onChange={handleChange}
                placeholder="How did you hear about us?"
              />
            </FormGroup>
          </ProfileCard>
          
          <ProfileCard>
            <ProfileHeader>
              <div className="title">Address</div>
            </ProfileHeader>
            
            <FormRow>
              <FormGroup>
                <label>Select Country</label>
                <select 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange}
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label>State</label>
                <select 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange}
                >
                  <option value="Lagos">Lagos</option>
                  <option value="Abuja">Abuja</option>
                  <option value="Port Harcourt">Port Harcourt</option>
                </select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Address (e.g. 5, Really Great Street)</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange}
                />
              </FormGroup>
              
              <FormGroup>
                <label>City (e.g. Ikeja)</label>
                <input 
                  type="text" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange}
                />
              </FormGroup>
            </FormRow>
            
            <ToggleSwitch>
              <div className="switch">
                <input type="checkbox" id="studentProfile" />
                <span className="slider"></span>
              </div>
              <label className="switch-label" htmlFor="studentProfile">
                Student Profile
              </label>
            </ToggleSwitch>
          </ProfileCard>
          
          <ProfileCard>
            <ProfileHeader>
              <div className="title">Course Details</div>
            </ProfileHeader>
            
            <CourseDetailsSection>
              <CourseFields>
                <FormGroup>
                  <label>Activity</label>
                  <select 
                    name="activity" 
                    value={formData.activity} 
                    onChange={handleChange}
                  >
                    <option value="Swimming">Swimming</option>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <label>Course</label>
                  <select 
                    name="course" 
                    value={formData.course} 
                    onChange={handleChange}
                  >
                    <option value="Adult swimming">Adult swimming</option>
                    <option value="Learn to Swim: 3 - 5">Learn to Swim: 3 - 5</option>
                    <option value="Survival Swimming">Survival Swimming</option>
                  </select>
                </FormGroup>
              </CourseFields>
            </CourseDetailsSection>
            
            <CourseDetailsSection>
              <CourseFields>
                <FormGroup>
                  <label>Facility</label>
                  <select 
                    name="facility" 
                    value={formData.facility} 
                    onChange={handleChange}
                  >
                    <option value="Ziggies Lifestyle Arena, Magodo">Ziggies Lifestyle Arena, Magodo</option>
                    <option value="Downtown pool">Downtown pool</option>
                    <option value="Greenspring School, Lekki">Greenspring School, Lekki</option>
                  </select>
                </FormGroup>
                
                <FormGroup>
                  <label>Instructor</label>
                  <select 
                    name="instructor" 
                    value={formData.instructor} 
                    onChange={handleChange}
                  >
                    <option value="Coach Debby">Coach Debby</option>
                    <option value="Coach Remmy">Coach Remmy</option>
                    <option value="Olawale Gbadamosi">Olawale Gbadamosi</option>
                  </select>
                </FormGroup>
              </CourseFields>
            </CourseDetailsSection>
          </ProfileCard>
          
          <ProfileCard>
            <ProfileHeader>
              <div className="title">Emergency Contacts</div>
            </ProfileHeader>
            
            {student.emergencyContacts.map(contact => (
              <EmergencyContact key={contact.id}>
                <div className="contact-info">
                  <div className="name">{contact.name}</div>
                  <div className="relation">{contact.relationship} • {contact.phone}</div>
                </div>
                <div className="contact-actions">
                  <button><User size={16} /></button>
                  <button><Phone size={16} /></button>
                </div>
              </EmergencyContact>
            ))}
            
            <button className="btn btn-secondary">
              Add emergency contact
            </button>
          </ProfileCard>
          
          <ProfileCard>
            <ProfileHeader>
              <div className="title">Medical Information</div>
            </ProfileHeader>
            
            <FormGroup>
              <ToggleSwitch>
                <div className="switch">
                  <input 
                    type="checkbox" 
                    id="allergies" 
                    checked={formData.medicalInformation?.hasAllergies}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        medicalInformation: {
                          ...formData.medicalInformation,
                          hasAllergies: !formData.medicalInformation?.hasAllergies
                        }
                      });
                    }}
                  />
                  <span className="slider"></span>
                </div>
                <label className="switch-label" htmlFor="allergies">
                  Does student have any allergies?
                </label>
              </ToggleSwitch>
            </FormGroup>
            
            {formData.medicalInformation?.hasAllergies && (
              <FormGroup>
                <label>Please list all allergies</label>
                <input 
                  type="text" 
                  name="allergies" 
                  value={formData.medicalInformation?.allergies} 
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      medicalInformation: {
                        ...formData.medicalInformation,
                        allergies: e.target.value
                      }
                    });
                  }}
                />
              </FormGroup>
            )}
            
            <FormGroup>
              <ToggleSwitch>
                <div className="switch">
                  <input 
                    type="checkbox" 
                    id="medicalConditions" 
                    checked={formData.medicalInformation?.hasMedicalConditions}
                    onChange={() => {
                      setFormData({
                        ...formData,
                        medicalInformation: {
                          ...formData.medicalInformation,
                          hasMedicalConditions: !formData.medicalInformation?.hasMedicalConditions
                        }
                      });
                    }}
                  />
                  <span className="slider"></span>
                </div>
                <label className="switch-label" htmlFor="medicalConditions">
                  Does student have any medical conditions?
                </label>
              </ToggleSwitch>
            </FormGroup>
            
            {formData.medicalInformation?.hasMedicalConditions && (
              <FormGroup>
                <label>Please list all medical conditions</label>
                <input 
                  type="text" 
                  name="medicalConditions" 
                  value={formData.medicalInformation?.medicalConditions} 
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      medicalInformation: {
                        ...formData.medicalInformation,
                        medicalConditions: e.target.value
                      }
                    });
                  }}
                />
              </FormGroup>
            )}
            
            <FormGroup>
              <label>Current medications (optional)</label>
              <input 
                type="text" 
                name="medications" 
                value={formData.medicalInformation?.medications} 
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    medicalInformation: {
                      ...formData.medicalInformation,
                      medications: e.target.value
                    }
                  });
                }}
              />
            </FormGroup>
          </ProfileCard>
        </>
      )}
    </ProfileContainer>
  );
};

export default StudentProfiles; 