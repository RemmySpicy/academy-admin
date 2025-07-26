/**
 * Shared form components exports
 */

import { FormField } from './FormField';
import { AddressForm } from './AddressForm';
import { EmergencyContactForm } from './EmergencyContactForm';
import { TabContainer, TabPanel } from './TabContainer';
import { PersonSearchAndSelect } from './PersonSearchAndSelect';
import { OrganizationSelector } from './OrganizationSelector';
import { RelationshipManager } from './RelationshipManager';
import { PaymentOverrideCard } from './PaymentOverrideCard';

export { FormField, type FormFieldProps } from './FormField';
export { AddressForm, type AddressData } from './AddressForm';
export { EmergencyContactForm, type EmergencyContactData } from './EmergencyContactForm';
export { TabContainer, TabPanel, type TabConfig } from './TabContainer';
export { PersonSearchAndSelect } from './PersonSearchAndSelect';
export { OrganizationSelector } from './OrganizationSelector';
export { RelationshipManager } from './RelationshipManager';
export { PaymentOverrideCard } from './PaymentOverrideCard';

export default {
  FormField,
  AddressForm,
  EmergencyContactForm,
  TabContainer,
  TabPanel,
  PersonSearchAndSelect,
  OrganizationSelector,
  RelationshipManager,
  PaymentOverrideCard,
};