import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Save, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Shield, 
  Info, 
  CheckCircle, 
  X 
} from 'lucide-react';

const FormContainer = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow);
  overflow: hidden;
`;

const FormHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h1 {
    font-size: 1.5rem;
    margin: 0;
  }
  
  .actions {
    display: flex;
    gap: 12px;
  }
`;

const FormButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: none;
    
    &:hover {
      background-color: var(--primary-dark);
    }
  }
  
  &.secondary {
    background-color: white;
    color: var(--gray-700);
    border: 1px solid var(--gray-300);
    
    &:hover {
      background-color: var(--gray-100);
    }
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--gray-200);
  background-color: var(--gray-50);
`;

const Tab = styled.button`
  padding: 16px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-600)'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-800)'};
  }
  
  .tab-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .tab-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-200)'};
    color: ${props => props.active ? 'white' : 'var(--gray-600)'};
    font-size: 12px;
    font-weight: 600;
  }
`;

const FormContent = styled.div`
  padding: 24px;
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  h2 {
    font-size: 1.25rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: var(--primary-color);
    }
  }
  
  .section-description {
    font-size: 14px;
    color: var(--gray-600);
    margin-bottom: 20px;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  
  label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
    color: var(--gray-700);
    display: flex;
    align-items: center;
    gap: 4px;
    
    .required {
      color: var(--danger-color);
    }
  }
  
  .helper-text {
    font-size: 12px;
    color: var(--gray-500);
    margin-top: 4px;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const Textarea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  transition: all 0.2s;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: var(--primary-color);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius);
  font-size: 12px;
  
  button {
    background: none;
    border: none;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
  }
`;

const TagInput = styled.div`
  display: flex;
  align-items: center;
  
  input {
    flex: 1;
    border: none;
    padding: 0;
    outline: none;
    font-size: 14px;
    
    &::placeholder {
      color: var(--gray-400);
    }
  }
`;

const TagsInputWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius);
  transition: all 0.2s;
  
  &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
  }
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  margin-bottom: 12px;
  
  .day {
    font-weight: 500;
    width: 100px;
  }
  
  .time {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
  }
  
  .actions {
    button {
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--gray-100);
  color: var(--gray-700);
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-200);
  }
`;

const CourseCreate = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [tags, setTags] = useState(['Swimming', 'Beginner']);
  const [tagInput, setTagInput] = useState('');
  const [schedules, setSchedules] = useState([
    { day: 'Monday', startTime: '16:00', endTime: '17:00' },
    { day: 'Wednesday', startTime: '16:00', endTime: '17:00' },
    { day: 'Friday', startTime: '16:00', endTime: '17:00' }
  ]);
  
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleRemoveSchedule = (index) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
  };
  
  const handleAddSchedule = () => {
    setSchedules([...schedules, { day: 'Monday', startTime: '16:00', endTime: '17:00' }]);
  };
  
  return (
    <FormContainer>
      <FormHeader>
        <h1>Create New Course</h1>
        <div className="actions">
          <FormButton className="secondary">Cancel</FormButton>
          <FormButton className="primary">
            <Save size={18} />
            Save Course
          </FormButton>
        </div>
      </FormHeader>
      
      <TabsContainer>
        <Tab active={activeTab === 'basic'} onClick={() => setActiveTab('basic')}>
          <div className="tab-content">
            <div className="tab-number">1</div>
            Basic Information
          </div>
        </Tab>
        <Tab active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')}>
          <div className="tab-content">
            <div className="tab-number">2</div>
            Schedule & Pricing
          </div>
        </Tab>
        <Tab active={activeTab === 'details'} onClick={() => setActiveTab('details')}>
          <div className="tab-content">
            <div className="tab-number">3</div>
            Course Details
          </div>
        </Tab>
      </TabsContainer>
      
      {activeTab === 'basic' && (
        <FormContent>
          <FormSection>
            <h2><Info size={20} /> Course Information</h2>
            <p className="section-description">
              Enter the basic information about the course. This will be displayed to students and parents.
            </p>
            
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label>Course Name <span className="required">*</span></label>
                <Input type="text" placeholder="e.g. Learn to Swim - Beginners" />
              </FormGroup>
              
              <FormGroup>
                <label>Course Code</label>
                <Input type="text" placeholder="e.g. LTS-101" />
                <div className="helper-text">A unique identifier for this course</div>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Description <span className="required">*</span></label>
                <Textarea placeholder="Provide a detailed description of the course..." />
              </FormGroup>
            </FormRow>
            
            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <label>Category <span className="required">*</span></label>
                <Select>
                  <option value="">Select a category</option>
                  <option value="learn-to-swim">Learn to Swim</option>
                  <option value="competitive">Competitive Swimming</option>
                  <option value="water-safety">Water Safety</option>
                  <option value="special-needs">Special Needs</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <label>Level <span className="required">*</span></label>
                <Select>
                  <option value="">Select a level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <label>Age Group <span className="required">*</span></label>
                <Select>
                  <option value="">Select an age group</option>
                  <option value="toddler">Toddler (1-3)</option>
                  <option value="preschool">Preschool (3-5)</option>
                  <option value="children">Children (6-12)</option>
                  <option value="teen">Teen (13-17)</option>
                  <option value="adult">Adult (18+)</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Tags</label>
                <TagsInputWrapper>
                  {tags.map((tag, index) => (
                    <Tag key={index}>
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)}>
                        <X size={14} />
                      </button>
                    </Tag>
                  ))}
                  <TagInput>
                    <input 
                      type="text" 
                      placeholder={tags.length === 0 ? "Add tags..." : ""} 
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                    />
                  </TagInput>
                </TagsInputWrapper>
                <div className="helper-text">Press Enter to add a tag</div>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><Shield size={20} /> Safety & Requirements</h2>
            <p className="section-description">
              Specify any safety requirements or prerequisites for this course.
            </p>
            
            <FormRow>
              <FormGroup>
                <label>Prerequisites</label>
                <Textarea placeholder="List any prerequisites for this course..." />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Safety Requirements <span className="required">*</span></label>
                <CheckboxGroup>
                  <CheckboxItem>
                    <input type="checkbox" id="safety-waiver" />
                    <span>Safety Waiver</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="medical-clearance" />
                    <span>Medical Clearance</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="parent-attendance" />
                    <span>Parent Attendance</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="swim-cap" />
                    <span>Swim Cap Required</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="goggles" />
                    <span>Goggles Required</span>
                  </CheckboxItem>
                </CheckboxGroup>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <FormButton className="primary" onClick={() => setActiveTab('schedule')}>
              Next: Schedule & Pricing
              <ChevronRight size={18} />
            </FormButton>
          </div>
        </FormContent>
      )}
      
      {activeTab === 'schedule' && (
        <FormContent>
          <FormSection>
            <h2><Calendar size={20} /> Schedule Information</h2>
            <p className="section-description">
              Set up the schedule for this course, including start and end dates, class times, and frequency.
            </p>
            
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label>Start Date <span className="required">*</span></label>
                <Input type="date" />
              </FormGroup>
              
              <FormGroup>
                <label>End Date <span className="required">*</span></label>
                <Input type="date" />
              </FormGroup>
            </FormRow>
            
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label>Duration (weeks) <span className="required">*</span></label>
                <Input type="number" min="1" placeholder="e.g. 8" />
              </FormGroup>
              
              <FormGroup>
                <label>Sessions <span className="required">*</span></label>
                <Input type="number" min="1" placeholder="e.g. 16" />
                <div className="helper-text">Total number of sessions in the course</div>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Class Schedule <span className="required">*</span></label>
                {schedules.map((schedule, index) => (
                  <ScheduleItem key={index}>
                    <div className="day">
                      <Select value={schedule.day} onChange={(e) => {
                        const newSchedules = [...schedules];
                        newSchedules[index].day = e.target.value;
                        setSchedules(newSchedules);
                      }}>
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </Select>
                    </div>
                    <div className="time">
                      <Input 
                        type="time" 
                        value={schedule.startTime} 
                        onChange={(e) => {
                          const newSchedules = [...schedules];
                          newSchedules[index].startTime = e.target.value;
                          setSchedules(newSchedules);
                        }}
                      />
                      <span>to</span>
                      <Input 
                        type="time" 
                        value={schedule.endTime} 
                        onChange={(e) => {
                          const newSchedules = [...schedules];
                          newSchedules[index].endTime = e.target.value;
                          setSchedules(newSchedules);
                        }}
                      />
                    </div>
                    <div className="actions">
                      <button onClick={() => handleRemoveSchedule(index)}>
                        <X size={18} />
                      </button>
                    </div>
                  </ScheduleItem>
                ))}
                <AddButton onClick={handleAddSchedule}>
                  + Add Another Time Slot
                </AddButton>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><DollarSign size={20} /> Pricing Information</h2>
            <p className="section-description">
              Set the pricing details for this course.
            </p>
            
            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <label>Price <span className="required">*</span></label>
                <Input type="number" min="0" step="0.01" placeholder="e.g. 199.99" />
              </FormGroup>
              
              <FormGroup>
                <label>Currency</label>
                <Select>
                  <option value="NGN">NGN (₦)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <label>Payment Options</label>
                <Select>
                  <option value="full">Full Payment</option>
                  <option value="installment">Installment</option>
                  <option value="both">Both</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Discounts & Promotions</label>
                <CheckboxGroup>
                  <CheckboxItem>
                    <input type="checkbox" id="early-bird" />
                    <span>Early Bird (10% off)</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="sibling" />
                    <span>Sibling Discount (15% off)</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="returning" />
                    <span>Returning Student (5% off)</span>
                  </CheckboxItem>
                </CheckboxGroup>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormButton className="secondary" onClick={() => setActiveTab('basic')}>
              Back: Basic Information
            </FormButton>
            <FormButton className="primary" onClick={() => setActiveTab('details')}>
              Next: Course Details
              <ChevronRight size={18} />
            </FormButton>
          </div>
        </FormContent>
      )}
      
      {activeTab === 'details' && (
        <FormContent>
          <FormSection>
            <h2><Users size={20} /> Capacity & Enrollment</h2>
            <p className="section-description">
              Set the capacity limits and enrollment options for this course.
            </p>
            
            <FormRow columns="1fr 1fr 1fr">
              <FormGroup>
                <label>Minimum Students</label>
                <Input type="number" min="1" placeholder="e.g. 5" />
              </FormGroup>
              
              <FormGroup>
                <label>Maximum Students <span className="required">*</span></label>
                <Input type="number" min="1" placeholder="e.g. 15" />
              </FormGroup>
              
              <FormGroup>
                <label>Student-Instructor Ratio <span className="required">*</span></label>
                <Input type="text" placeholder="e.g. 8:1" />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Waitlist Options</label>
                <CheckboxGroup>
                  <CheckboxItem>
                    <input type="checkbox" id="enable-waitlist" checked />
                    <span>Enable Waitlist</span>
                  </CheckboxItem>
                  <CheckboxItem>
                    <input type="checkbox" id="auto-enroll" />
                    <span>Auto-enroll from waitlist</span>
                  </CheckboxItem>
                </CheckboxGroup>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><Clock size={20} /> Learning Objectives</h2>
            <p className="section-description">
              Define what students will learn in this course.
            </p>
            
            <FormRow>
              <FormGroup>
                <label>Learning Objectives <span className="required">*</span></label>
                <Textarea placeholder="List the main learning objectives for this course..." />
                <div className="helper-text">Enter each objective on a new line</div>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Assessment Criteria</label>
                <Textarea placeholder="Describe how students will be assessed..." />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label>Curriculum Link</label>
                <Select>
                  <option value="">Select a curriculum</option>
                  <option value="learn-to-swim">Learn to Swim Curriculum</option>
                  <option value="competitive">Competitive Swimming Curriculum</option>
                  <option value="water-safety">Water Safety Curriculum</option>
                </Select>
                <div className="helper-text">Link this course to an existing curriculum</div>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <FormSection>
            <h2><CheckCircle size={20} /> Completion & Certification</h2>
            <p className="section-description">
              Define completion requirements and certification options.
            </p>
            
            <FormRow columns="1fr 1fr">
              <FormGroup>
                <label>Completion Requirements</label>
                <Select>
                  <option value="attendance">Attendance Based (80% minimum)</option>
                  <option value="assessment">Assessment Based</option>
                  <option value="both">Both Attendance & Assessment</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <label>Certificate</label>
                <Select>
                  <option value="yes">Yes - Issue Certificate</option>
                  <option value="no">No - No Certificate</option>
                </Select>
              </FormGroup>
            </FormRow>
          </FormSection>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <FormButton className="secondary" onClick={() => setActiveTab('schedule')}>
              Back: Schedule & Pricing
            </FormButton>
            <FormButton className="primary">
              <Save size={18} />
              Save Course
            </FormButton>
          </div>
        </FormContent>
      )}
    </FormContainer>
  );
};

export default CourseCreate; 