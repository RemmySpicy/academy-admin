import React, { useState } from 'react';
import styled from 'styled-components';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown,
  MoreVertical,
  MapPin,
  Phone,
  Users,
  Calendar,
  Clock,
  Star,
  AlertCircle,
  Wrench
} from 'lucide-react';

const PageContainer = styled.div`
  padding: 20px 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled.button`
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

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  
  input {
    width: 100%;
    padding: 10px 16px 10px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 15px;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #6c5ce7;
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #cbd5e0;
  }
`;

const FacilityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const FacilityCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FacilityImage = styled.div`
  height: 160px;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
  
  .facility-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    
    &.active {
      background-color: #38b2ac;
      color: white;
    }
    
    &.maintenance {
      background-color: #ed8936;
      color: white;
    }
  }
`;

const FacilityContent = styled.div`
  padding: 20px;
`;

const FacilityHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  .title {
    font-weight: 600;
    font-size: 18px;
    color: #2d3748;
  }
  
  .menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: none;
    color: #718096;
    cursor: pointer;
    
    &:hover {
      background-color: #f7fafc;
    }
  }
`;

const FacilityDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #718096;
  font-size: 14px;
  
  svg {
    color: #6c5ce7;
  }
`;

const FacilityStats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const StatItem = styled.div`
  .label {
    font-size: 13px;
    color: #718096;
    margin-bottom: 2px;
  }
  
  .value {
    font-size: 15px;
    font-weight: 600;
    color: #2d3748;
    display: flex;
    align-items: center;
    gap: 4px;
    
    svg {
      color: ${props => props.iconColor || '#6c5ce7'};
    }
  }
`;

const MaintenanceAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #fed7d7;
  border-left: 4px solid #e53e3e;
  border-radius: 4px;
  font-size: 13px;
  color: #c53030;
  margin-top: 16px;
  
  svg {
    color: #e53e3e;
  }
`;

// Mock facility data
const mockFacilities = [
  {
    id: 1,
    name: 'Ziggies Lifestyle Arena',
    image: 'https://images.unsplash.com/photo-1560090995-e5333133698d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2249&q=80',
    address: 'Plot 2, Mobalaji Johnson Avenue, Magodo GRA, Lagos',
    phone: '+234 802 123 4567',
    headName: 'Mr. Johnson Smith',
    capacity: {
      students: 50,
      staff: 8
    },
    stats: {
      utilization: 78,
      events: 12,
      rating: 4.8
    },
    maintenance: {
      required: false,
      issues: 0
    },
    status: 'active'
  },
  {
    id: 2,
    name: 'Downtown Swimming Pool',
    image: 'https://images.unsplash.com/photo-1576013551627-0fd2f6e86d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    address: '15, Admiralty Way, Lekki Phase 1, Lagos',
    phone: '+234 812 345 6789',
    headName: 'Mrs. Sarah Johnson',
    capacity: {
      students: 35,
      staff: 6
    },
    stats: {
      utilization: 65,
      events: 8,
      rating: 4.5
    },
    maintenance: {
      required: true,
      issues: 3
    },
    status: 'maintenance'
  },
  {
    id: 3,
    name: 'Greenspring School',
    image: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    address: 'Anthony Village, Lekki',
    phone: '+234 905 678 1234',
    headName: 'Mr. Peter Okoye',
    capacity: {
      students: 60,
      staff: 10
    },
    stats: {
      utilization: 82,
      events: 15,
      rating: 4.9
    },
    maintenance: {
      required: false,
      issues: 0
    },
    status: 'active'
  },
];

const FacilitiesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const navigate = useNavigate();
  
  const handleFacilityClick = (facilityId) => {
    navigate(`/facilities/${facilityId}`);
  };
  
  const filteredFacilities = mockFacilities.filter(facility => 
    facility.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <PageContainer>
      <PageHeader>
        <Title>Facility management</Title>
        <ActionButton>
          <Plus size={18} />
          Add New Facility
        </ActionButton>
      </PageHeader>
      
      <SearchFilterContainer>
        <SearchInput>
          <input 
            type="text" 
            placeholder="Search facilities" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} />
        </SearchInput>
        <FilterButton onClick={() => setShowFilter(!showFilter)}>
          <Filter size={18} />
          Filters
          <ChevronDown size={14} />
        </FilterButton>
      </SearchFilterContainer>
      
      <Routes>
        <Route index element={
          <FacilityGrid>
            {filteredFacilities.map(facility => (
              <FacilityCard key={facility.id} onClick={() => handleFacilityClick(facility.id)}>
                <FacilityImage image={facility.image}>
                  <div className={`facility-status ${facility.status}`}>
                    {facility.status === 'active' ? 'Active' : 'Maintenance'}
                  </div>
                </FacilityImage>
                <FacilityContent>
                  <FacilityHeader>
                    <div className="title">{facility.name}</div>
                    <button className="menu-button">
                      <MoreVertical size={18} />
                    </button>
                  </FacilityHeader>
                  
                  <FacilityDetails>
                    <DetailItem>
                      <MapPin size={16} />
                      <span>{facility.address}</span>
                    </DetailItem>
                    <DetailItem>
                      <Phone size={16} />
                      <span>{facility.phone}</span>
                    </DetailItem>
                    <DetailItem>
                      <Users size={16} />
                      <span>
                        {facility.capacity.students} students, {facility.capacity.staff} staff
                      </span>
                    </DetailItem>
                  </FacilityDetails>
                  
                  <FacilityStats>
                    <StatItem>
                      <div className="label">Utilization</div>
                      <div className="value">
                        <Clock size={14} />
                        {facility.stats.utilization}%
                      </div>
                    </StatItem>
                    <StatItem>
                      <div className="label">Upcoming Events</div>
                      <div className="value">
                        <Calendar size={14} />
                        {facility.stats.events}
                      </div>
                    </StatItem>
                    <StatItem>
                      <div className="label">Rating</div>
                      <div className="value">
                        <Star size={14} iconColor="#f6ad55" />
                        {facility.stats.rating}
                      </div>
                    </StatItem>
                    <StatItem>
                      <div className="label">Maintenance</div>
                      <div className="value">
                        <Wrench size={14} iconColor={facility.maintenance.required ? "#e53e3e" : "#38b2ac"} />
                        {facility.maintenance.issues} issues
                      </div>
                    </StatItem>
                  </FacilityStats>
                  
                  {facility.maintenance.required && (
                    <MaintenanceAlert>
                      <AlertCircle size={14} />
                      Maintenance required: {facility.maintenance.issues} issues
                    </MaintenanceAlert>
                  )}
                </FacilityContent>
              </FacilityCard>
            ))}
          </FacilityGrid>
        } />
      </Routes>
    </PageContainer>
  );
};

export default FacilitiesPage; 