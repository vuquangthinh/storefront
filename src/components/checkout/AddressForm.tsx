"use client";

import { ChangeEvent } from 'react';

export type AddressFormValues = {
  firstName: string;
  lastName: string;
  company: string;
  countryCode: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
};

export type CountryOption = {
  code: string;
  name: string;
};

type AddressFormProps = {
  idPrefix: string;
  address: AddressFormValues;
  countries: CountryOption[];
  onFieldChange: (field: keyof AddressFormValues, value: string) => void;
};

export function AddressForm({ idPrefix, address, countries, onFieldChange }: AddressFormProps) {
  const handleChange = (field: keyof AddressFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onFieldChange(field, event.target.value);
  };

  return (
    <>
      <div className="row">
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-first-name`}>First Name *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-first-name`}
            name={`${idPrefix}-first-name`}
            required
            value={address.firstName}
            onChange={handleChange('firstName')}
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-last-name`}>Last Name *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-last-name`}
            name={`${idPrefix}-last-name`}
            required
            value={address.lastName}
            onChange={handleChange('lastName')}
          />
        </div>
      </div>

      <label htmlFor={`${idPrefix}-company`}>Company Name (Optional)</label>
      <input
        type="text"
        className="form-control"
        id={`${idPrefix}-company`}
        name={`${idPrefix}-company`}
        value={address.company}
        onChange={handleChange('company')}
      />

      <label htmlFor={`${idPrefix}-country`}>Country / Region *</label>
      <div className="select-box">
        <select
          id={`${idPrefix}-country`}
          name={`${idPrefix}-country`}
          className="form-control"
          value={address.countryCode || ''}
          onChange={handleChange('countryCode')}
          required
        >
          <option value="" disabled>
            Select country
          </option>
          {countries.map((country) => (
            <option key={`${idPrefix}-country-${country.code}`} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </div>

      <label htmlFor={`${idPrefix}-address1`}>Street Address *</label>
      <input
        type="text"
        className="form-control"
        id={`${idPrefix}-address1`}
        name={`${idPrefix}-address1`}
        placeholder="House number and street name"
        value={address.address1}
        onChange={handleChange('address1')}
        required
      />
      <input
        type="text"
        className="form-control"
        id={`${idPrefix}-address2`}
        name={`${idPrefix}-address2`}
        placeholder="Apartment, suite, unit, etc. (optional)"
        value={address.address2}
        onChange={handleChange('address2')}
      />

      <div className="row">
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-city`}>Town / City *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-city`}
            name={`${idPrefix}-city`}
            value={address.city}
            onChange={handleChange('city')}
            required
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-state`}>State *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-state`}
            name={`${idPrefix}-state`}
            value={address.state}
            onChange={handleChange('state')}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-postal`}>ZIP *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-postal`}
            name={`${idPrefix}-postal`}
            value={address.postalCode}
            onChange={handleChange('postalCode')}
            required
          />
        </div>
        <div className="col-xs-6">
          <label htmlFor={`${idPrefix}-phone`}>Phone *</label>
          <input
            type="text"
            className="form-control"
            id={`${idPrefix}-phone`}
            name={`${idPrefix}-phone`}
            value={address.phone}
            onChange={handleChange('phone')}
          />
        </div>
      </div>
    </>
  );
}
