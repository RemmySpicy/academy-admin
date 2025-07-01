import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  X,
  Image,
  BookOpen,
  MapPin,
  Award,
  Plus,
  Link as LinkIcon
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

const FormNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 24px;
  border-top: 1px solid var(--gray-200);
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

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
`;

const RadioItem = styled.label`
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

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--gray-100);
  border: 1px dashed var(--gray-300);
  border-radius: var(--border-radius);
  color: var(--gray-600);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--gray-200);
    color: var(--gray-800);
  }
`;

const ItemList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  
  .item-content {
    flex: 1;
  }
  
  .item-actions {
    display: flex;
    gap: 4px;
    
    button {
      background: none;
      border: none;
      color: var(--gray-500);
      cursor: pointer;
      padding: 4px;
      border-radius: var(--border-radius-sm);
      
      &:hover {
        background-color: var(--gray-200);
        color: var(--gray-800);
      }
      
      &.danger:hover {
        color: var(--danger-color);
      }
    }
  }
`;

const AgeRangeGroup = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AgeRangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .age-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .age-input {
    width: 80px;
  }
  
  .remove-button {
    background: none;
    border: none;
    color: var(--danger-color);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--border-radius-sm);
    
    &:hover {
      background-color: var(--danger-light);
    }
  }
`;

const PriceRangeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .price-input {
    width: 120px;
  }
`;

const CurriculaPreview = styled.div`
  margin-top: 16px;
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  padding: 16px;
  
  .curricula-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    h3 {
      font-size: 16px;
      margin: 0;
    }
    
    .view-button {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .curricula-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .curricula-item {
    padding: 12px;
    background-color: var(--gray-50);
    border-radius: var(--border-radius);
    font-size: 14px;
  }
`;

const sampleCourses = [
  {
    id: '1',
    name: 'Learn to Swim',
    description: 'Comprehensive swimming program for beginners to intermediate swimmers.',
    imageUrl: 'https://images.unsplash.com/photo-1600965962361-9035dbfd1c50?ixlib=rb-4.0.3',
    learningPoints: ['Water safety', 'Basic strokes'],
    location: 'our-facilities',
    perks: ['certificate', 'equipment'],
    ageRanges: [{ from: '3', to: '5' }, { from: '6', to: '17' }],
    priceRange: { lowest: '15000', highest: '30000' },
    sessions: '24'
  },
  // Add more sample courses as needed
];

const CourseCreate2 = () => {
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    learningPoints: [''],
    location: 'our-facilities',
    perks: [],
    ageRanges: [{ from: '', to: '' }],
    priceRange: { lowest: '', highest: '' },
    sessions: ''
  });

  useEffect(() => {
    if (courseId) {
      const course = sampleCourses.find(c => c.id === courseId);
      if (course) {
        setFormData({
          name: course.name,
          description: course.description,
          imageUrl: course.imageUrl,
          learningPoints: course.learningPoints,
          location: course.location,
          perks: course.perks,
          ageRanges: course.ageRanges,
          priceRange: course.priceRange,
          sessions: course.sessions
        });
      }
    }
  }, [courseId]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    if (checked) {
      setFormData(prev => ({
        ...prev,
        perks: [...prev.perks, name]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        perks: prev.perks.filter(perk => perk !== name)
      }));
    }
  };
  
  const handleLearningPointChange = (index, value) => {
    const newLearningPoints = [...formData.learningPoints];
    newLearningPoints[index] = value;
    setFormData(prev => ({
      ...prev,
      learningPoints: newLearningPoints
    }));
  };
  
  const handleAddLearningPoint = () => {
    setFormData(prev => ({
      ...prev,
      learningPoints: [...prev.learningPoints, '']
    }));
  };
  
  const handleRemoveLearningPoint = (index) => {
    const newLearningPoints = [...formData.learningPoints];
    newLearningPoints.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      learningPoints: newLearningPoints
    }));
  };
  
  const handleAgeRangeChange = (index, field, value) => {
    const newAgeRanges = [...formData.ageRanges];
    newAgeRanges[index] = {
      ...newAgeRanges[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      ageRanges: newAgeRanges
    }));
  };
  
  const handleAddAgeRange = () => {
    setFormData(prev => ({
      ...prev,
      ageRanges: [...prev.ageRanges, { from: '', to: '' }]
    }));
  };
  
  const handleRemoveAgeRange = (index) => {
    const newAgeRanges = [...formData.ageRanges];
    newAgeRanges.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      ageRanges: newAgeRanges
    }));
  };
  
  const handlePriceRangeChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: value
      }
    }));
  };
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 1:
        return (
          <React.Fragment>
            <FormContent>
              <FormSection>
                <h2>
                  <Info size={20} />
                  Basic Information
                </h2>
                <p className="section-description">
                  Enter the basic details about the course.
                </p>
                
                <FormRow>
                  <FormGroup>
                    <label>
                      Course Name <span className="required">*</span>
                    </label>
                    <Input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange}
                      placeholder="Enter course name"
                      required 
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>
                      Description <span className="required">*</span>
                    </label>
                    <Textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange}
                      placeholder="Enter course description"
                      required 
                    />
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>
                      <Image size={16} />
                      Image URL
                    </label>
                    <Input 
                      type="text" 
                      name="imageUrl" 
                      value={formData.imageUrl} 
                      onChange={handleInputChange}
                      placeholder="Enter URL for course image"
                    />
                    <p className="helper-text">Provide a URL for the course cover image</p>
                  </FormGroup>
                </FormRow>
              </FormSection>
            </FormContent>
            <FormNavigation>
              <div></div>
              <FormButton 
                className="primary"
                onClick={() => setActiveTab(2)}
              >
                Next: Course Options
                <ChevronRight size={18} />
              </FormButton>
            </FormNavigation>
          </React.Fragment>
        );
      case 2:
        return (
          <React.Fragment>
            <FormContent>
              <FormSection>
                <h2>
                  <BookOpen size={20} />
                  Course Options
                </h2>
                <p className="section-description">
                  Configure the course options and requirements.
                </p>
                
                <FormRow>
                  <FormGroup>
                    <label>What You'll Learn</label>
                    <ItemList>
                      {formData.learningPoints.map((point, index) => (
                        <Item key={index}>
                          <div className="item-content">
                            <Input 
                              type="text" 
                              value={point} 
                              onChange={(e) => handleLearningPointChange(index, e.target.value)}
                              placeholder="Enter learning point"
                            />
                          </div>
                          <div className="item-actions">
                            <button 
                              className="danger" 
                              onClick={() => handleRemoveLearningPoint(index)}
                              disabled={formData.learningPoints.length === 1}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </Item>
                      ))}
                    </ItemList>
                    <AddButton onClick={handleAddLearningPoint}>
                      <Plus size={16} />
                      Add Learning Point
                    </AddButton>
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>Location</label>
                    <RadioGroup>
                      <RadioItem>
                        <input 
                          type="radio" 
                          name="location" 
                          value="our-facilities" 
                          checked={formData.location === 'our-facilities'} 
                          onChange={handleInputChange}
                        />
                        <div>
                          <div>Our Facilities</div>
                          <div className="helper-text">Classes held at our swimming pool</div>
                        </div>
                      </RadioItem>
                      <RadioItem>
                        <input 
                          type="radio" 
                          name="location" 
                          value="preferred-location" 
                          checked={formData.location === 'preferred-location'} 
                          onChange={handleInputChange}
                        />
                        <div>
                          <div>Your Preferred Location</div>
                          <div className="helper-text">We come to your location</div>
                        </div>
                      </RadioItem>
                    </RadioGroup>
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>Perks</label>
                    <CheckboxGroup>
                      <CheckboxItem>
                        <input 
                          type="checkbox" 
                          name="certificate" 
                          checked={formData.perks.includes('certificate')} 
                          onChange={handleCheckboxChange}
                        />
                        <span>Certificate</span>
                      </CheckboxItem>
                      <CheckboxItem>
                        <input 
                          type="checkbox" 
                          name="equipment" 
                          checked={formData.perks.includes('equipment')} 
                          onChange={handleCheckboxChange}
                        />
                        <span>Equipment Provided</span>
                      </CheckboxItem>
                      <CheckboxItem>
                        <input 
                          type="checkbox" 
                          name="one-on-one" 
                          checked={formData.perks.includes('one-on-one')} 
                          onChange={handleCheckboxChange}
                        />
                        <span>One-on-One Sessions</span>
                      </CheckboxItem>
                      <CheckboxItem>
                        <input 
                          type="checkbox" 
                          name="video-recording" 
                          checked={formData.perks.includes('video-recording')} 
                          onChange={handleCheckboxChange}
                        />
                        <span>Video Recording</span>
                      </CheckboxItem>
                    </CheckboxGroup>
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>Age Range</label>
                    <AgeRangeGroup>
                      {formData.ageRanges.map((range, index) => (
                        <AgeRangeItem key={index}>
                          <div className="age-inputs">
                            <Input 
                              type="number" 
                              className="age-input"
                              value={range.from} 
                              onChange={(e) => handleAgeRangeChange(index, 'from', e.target.value)}
                              placeholder="From"
                              min="0"
                            />
                            <span>to</span>
                            <Input 
                              type="number" 
                              className="age-input"
                              value={range.to} 
                              onChange={(e) => handleAgeRangeChange(index, 'to', e.target.value)}
                              placeholder="To"
                              min="0"
                            />
                          </div>
                          <button 
                            className="remove-button" 
                            onClick={() => handleRemoveAgeRange(index)}
                            disabled={formData.ageRanges.length === 1}
                          >
                            <X size={16} />
                          </button>
                        </AgeRangeItem>
                      ))}
                    </AgeRangeGroup>
                    <AddButton onClick={handleAddAgeRange} style={{ marginTop: '12px' }}>
                      <Plus size={16} />
                      Add Age Range
                    </AddButton>
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>Price Range (₦)</label>
                    <PriceRangeGroup>
                      <div className="price-inputs">
                        <Input 
                          type="number" 
                          className="price-input"
                          value={formData.priceRange.lowest} 
                          onChange={(e) => handlePriceRangeChange('lowest', e.target.value)}
                          placeholder="Lowest"
                          min="0"
                        />
                        <span>to</span>
                        <Input 
                          type="number" 
                          className="price-input"
                          value={formData.priceRange.highest} 
                          onChange={(e) => handlePriceRangeChange('highest', e.target.value)}
                          placeholder="Highest"
                          min="0"
                        />
                      </div>
                    </PriceRangeGroup>
                  </FormGroup>
                </FormRow>
                
                <FormRow>
                  <FormGroup>
                    <label>Number of Sessions</label>
                    <Input 
                      type="number" 
                      name="sessions" 
                      value={formData.sessions} 
                      onChange={handleInputChange}
                      placeholder="Enter number of sessions"
                      min="1"
                    />
                    <p className="helper-text">Number of sessions per payment term</p>
                  </FormGroup>
                </FormRow>
              </FormSection>
            </FormContent>
            <FormNavigation>
              <FormButton 
                className="secondary"
                onClick={() => setActiveTab(1)}
              >
                Back: Basic Information
              </FormButton>
              <FormButton 
                className="primary"
                onClick={() => setActiveTab(3)}
              >
                Next: Curricula
                <ChevronRight size={18} />
              </FormButton>
            </FormNavigation>
          </React.Fragment>
        );
      case 3:
        return (
          <React.Fragment>
            <FormContent>
              <FormSection>
                <h2>
                  <BookOpen size={20} />
                  Curricula
                </h2>
                <p className="section-description">
                  Define the curricula for different age ranges.
                </p>
                
                {formData.ageRanges.map((range, index) => (
                  <CurriculaPreview key={index}>
                    <div className="curricula-header">
                      <h3>Age Range: {range.from} - {range.to}</h3>
                      <button className="view-button">
                        <ChevronRight size={16} />
                        Customize Curriculum
                      </button>
                    </div>
                    <div className="curricula-list">
                      <div className="curricula-item">
                        Default curriculum for {range.from} - {range.to} age range
                      </div>
                    </div>
                  </CurriculaPreview>
                ))}
              </FormSection>
            </FormContent>
            <FormNavigation>
              <FormButton 
                className="secondary"
                onClick={() => setActiveTab(2)}
              >
                Back: Course Options
              </FormButton>
              <FormButton className="primary">
                <Save size={18} />
                Save Course
              </FormButton>
            </FormNavigation>
          </React.Fragment>
        );
      default:
        return null;
    }
  };
  
  return (
    <FormContainer>
      <FormHeader>
        <h1>Create New Course</h1>
        <div className="actions">
          <FormButton className="secondary">
            Cancel
          </FormButton>
          <FormButton className="primary">
            <Save size={18} />
            Save Course
          </FormButton>
        </div>
      </FormHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 1} 
          onClick={() => setActiveTab(1)}
        >
          <div className="tab-content">
            <div className="tab-number">1</div>
            <span>Basic Information</span>
          </div>
        </Tab>
        <Tab 
          active={activeTab === 2} 
          onClick={() => setActiveTab(2)}
        >
          <div className="tab-content">
            <div className="tab-number">2</div>
            <span>Course Options</span>
          </div>
        </Tab>
        <Tab 
          active={activeTab === 3} 
          onClick={() => setActiveTab(3)}
        >
          <div className="tab-content">
            <div className="tab-number">3</div>
            <span>Curricula</span>
          </div>
        </Tab>
      </TabsContainer>
      
      {renderTabContent()}
    </FormContainer>
  );
};

export default CourseCreate2; 