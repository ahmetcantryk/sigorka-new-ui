/**
 * Kasko Flow - Araç Seçimi Step Bileşeni
 */

'use client';

import { FormikProps } from 'formik';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { VEHICLE_USAGE_OPTIONS, FUEL_TYPE_OPTIONS, MODEL_YEAR_OPTIONS } from '../../config/kaskoConstants';
import type { VehicleFormData, ExistingVehicle } from '../../types';

interface VehicleSelectionStepProps {
  formik: FormikProps<VehicleFormData>;
  selectionType: 'existing' | 'new';
  vehicleType: 'plated' | 'unplated';
  vehicleDetailsStep: number;
  vehicles: ExistingVehicle[];
  selectedVehicleId: string | null;
  plateCities: Array<{ value: string; text: string }>;
  vehicleBrands: Array<{ value: string; text: string }>;
  vehicleModels: Array<{ value: string; text: string }>;
  isLoading: boolean;
  isTramerLoading: boolean;
  isModelsLoading: boolean;
  modelError: string | null;
  onSelectionTypeChange: (type: 'existing' | 'new') => void;
  onVehicleTypeChange: (type: 'plated' | 'unplated') => void;
  onVehicleSelect: (vehicleId: string) => void;
  onEditVehicle: (vehicleId: string, e: React.MouseEvent) => void;
  onTramerQuery: () => void;
  onBrandChange: (brandCode: string) => void;
  onYearChange: (year: string) => void;
  onVehicleDetailsStepChange: (step: number) => void;
  onSubmitExisting: () => void;
  onSubmitNew: () => void;
}

const VehicleSelectionStep = ({
  formik,
  selectionType,
  vehicleType,
  vehicleDetailsStep,
  vehicles,
  selectedVehicleId,
  plateCities,
  vehicleBrands,
  vehicleModels,
  isLoading,
  isTramerLoading,
  isModelsLoading,
  modelError,
  onSelectionTypeChange,
  onVehicleTypeChange,
  onVehicleSelect,
  onEditVehicle,
  onTramerQuery,
  onBrandChange,
  onYearChange,
  onVehicleDetailsStepChange,
  onSubmitExisting,
  onSubmitNew,
}: VehicleSelectionStepProps) => {
  const hasVehicles = vehicles.length > 0;

  // Kayıtlı araçlar render
  const renderExistingVehicles = () => (
    <div className="pp-existing-vehicles">
      <div className="pp-vehicles-grid">
        {vehicles.map((vehicle) => {
          let displayPlate = '';

          if (vehicle.plateCode && vehicle.plateCode.trim()) {
            displayPlate = vehicle.plateNumber;
          } else if (vehicle.plateCity) {
            const cityCode = String(vehicle.plateCity).padStart(2, '0');
            displayPlate = `Plakasız - ${cityCode}`;
          } else {
            displayPlate = 'Plakasız';
          }

          return (
            <div
              key={vehicle.id}
              className={`pp-vehicle-card ${selectedVehicleId === vehicle.id ? 'selected' : ''}`}
              onClick={() => onVehicleSelect(vehicle.id)}
            >
              <div className="pp-vehicle-content">
                <h4 className="pp-vehicle-brand">{vehicle.brand}</h4>
                <p className="pp-vehicle-model">{vehicle.model}</p>
                <p className="pp-vehicle-plate">{displayPlate}</p>
              </div>
              <div
                className="pp-vehicle-edit-icon"
                onClick={(e) => onEditVehicle(vehicle.id, e)}
              >
                <i className="icon-edit"></i>
              </div>
            </div>
          );
        })}
      </div>

      {selectedVehicleId && (
        <div className="pp-button-group">
          <button
            type="button"
            className="pp-btn-submit"
            onClick={onSubmitExisting}
            disabled={isLoading}
          >
            {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
          </button>
        </div>
      )}
    </div>
  );

  // Yeni araç formu - Plaka bilgileri
  const renderNewVehicleForm = () => (
    <>
      <div className="pp-form-group pp-vehicle-type-section">
        <div className="pp-radio-group">
          <label className="pp-radio-label">
            <input
              type="radio"
              name="vehicleType"
              value="plated"
              checked={vehicleType === 'plated'}
              onChange={() => onVehicleTypeChange('plated')}
            />
            <span>Plakalı Araç</span>
          </label>
          <label className="pp-radio-label">
            <input
              type="radio"
              name="vehicleType"
              value="unplated"
              checked={vehicleType === 'unplated'}
              onChange={() => onVehicleTypeChange('unplated')}
            />
            <span>Plakasız Araç</span>
          </label>
        </div>
      </div>

      {vehicleType === 'plated' && vehicleDetailsStep === 0 && (
        <>
          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.plateCity && formik.errors.plateCity && !formik.values.plateCity ? 'error' : ''}`}>
              <label className="pp-label">Plaka İl Kodu</label>
              <Dropdown
                id="plateCity"
                name="plateCity"
                value={formik.values.plateCity}
                options={plateCities.map(city => ({
                  label: `${parseInt(city.value) < 10 ? `0${city.value}` : city.value} - ${city.text}`,
                  value: city.value
                }))}
                onChange={async (e: DropdownChangeEvent) => {
                  await formik.setFieldValue('plateCity', e.value);
                  setTimeout(() => {
                    formik.setFieldTouched('plateCity', true, false);
                  }, 0);
                }}
                onBlur={() => formik.setFieldTouched('plateCity', true, false)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
              {formik.touched.plateCity && formik.errors.plateCity && !formik.values.plateCity && (
                <div className="pp-error-message">{formik.errors.plateCity}</div>
              )}
            </div>

            <div className={`pp-form-group ${formik.touched.plateCode && formik.errors.plateCode ? 'error' : ''}`}>
              <label className="pp-label">Plaka</label>
              <input
                type="text"
                className="pp-input"
                id="plateCode"
                name="plateCode"
                value={formik.values.plateCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
                  formik.setFieldValue('plateCode', value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Örn: AB1234"
                maxLength={6}
              />
              {formik.touched.plateCode && formik.errors.plateCode && (
                <div className="pp-error-message">{formik.errors.plateCode}</div>
              )}
            </div>
          </div>

          <div className="pp-form-row">
            <div className={`pp-form-group ${formik.touched.documentSerialCode && formik.errors.documentSerialCode ? 'error' : ''}`}>
              <label className="pp-label">Belge Seri Kodu</label>
              <input
                type="text"
                className="pp-input"
                id="documentSerialCode"
                name="documentSerialCode"
                value={formik.values.documentSerialCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
                  formik.setFieldValue('documentSerialCode', value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Örn: FP"
                maxLength={2}
              />
              {formik.touched.documentSerialCode && formik.errors.documentSerialCode && (
                <div className="pp-error-message">{formik.errors.documentSerialCode}</div>
              )}
            </div>

            <div className={`pp-form-group ${formik.touched.documentSerialNumber && formik.errors.documentSerialNumber ? 'error' : ''}`}>
              <label className="pp-label">Belge Seri Numarası</label>
              <input
                type="text"
                className="pp-input"
                id="documentSerialNumber"
                name="documentSerialNumber"
                value={formik.values.documentSerialNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  formik.setFieldValue('documentSerialNumber', value);
                }}
                onBlur={formik.handleBlur}
                placeholder="Örn: 373220"
                maxLength={6}
              />
              {formik.touched.documentSerialNumber && formik.errors.documentSerialNumber && (
                <div className="pp-error-message">{formik.errors.documentSerialNumber}</div>
              )}
            </div>
          </div>

          <div className="pp-button-group">
            <button
              type="button"
              className="pp-btn-submit"
              onClick={onTramerQuery}
              disabled={isTramerLoading || !formik.values.plateCity ||
                (vehicleType === 'plated' && (!formik.values.plateCode || !formik.values.documentSerialCode || !formik.values.documentSerialNumber))}
            >
              {isTramerLoading ? 'Sorgulanıyor...' : 'Devam Et'}
            </button>
          </div>
        </>
      )}
    </>
  );

  // Araç detayları formu
  const renderVehicleDetails = () => (
    <>
      <div>
        <div className="pp-form-row pp-form-row-3">
          {vehicleType === 'unplated' && (
            <div className={`pp-form-group ${formik.touched.plateCity && formik.errors.plateCity && !formik.values.plateCity ? 'error' : ''}`}>
              <label className="pp-label">Plaka İl Kodu</label>
              <Dropdown
                id="plateCityDetails"
                name="plateCity"
                value={formik.values.plateCity}
                options={plateCities.map(city => ({
                  label: `${parseInt(city.value) < 10 ? `0${city.value}` : city.value} - ${city.text}`,
                  value: city.value
                }))}
                onChange={async (e: DropdownChangeEvent) => {
                  await formik.setFieldValue('plateCity', e.value);
                  setTimeout(() => {
                    formik.setFieldTouched('plateCity', true, false);
                  }, 0);
                }}
                onBlur={() => formik.setFieldTouched('plateCity', true, false)}
                placeholder="Seçiniz"
                className="pp-dropdown"
                filter
                filterPlaceholder="Ara..."
                emptyFilterMessage="Sonuç bulunamadı"
                showClear={false}
              />
              {formik.touched.plateCity && formik.errors.plateCity && !formik.values.plateCity && (
                <div className="pp-error-message">{formik.errors.plateCity}</div>
              )}
            </div>
          )}

          <div className={`pp-form-group ${formik.touched.brandCode && formik.errors.brandCode && !formik.values.brandCode ? 'error' : ''}`}>
            <label className="pp-label">Marka</label>
            <Dropdown
              id="brandCode"
              name="brandCode"
              value={formik.values.brandCode}
              options={vehicleBrands
                .filter(b => b.text !== 'İŞ MAKİNASI' && b.text !== 'DİĞER')
                .map(brand => ({
                  label: brand.text,
                  value: brand.value
                }))}
              onChange={async (e: DropdownChangeEvent) => {
                if (e.value) {
                  await onBrandChange(e.value);
                } else {
                  await formik.setFieldValue('brandCode', '');
                  await formik.setFieldValue('brand', '');
                  await formik.setFieldValue('modelCode', '');
                  await formik.setFieldValue('model', '');
                }
                // Değer set edildikten sonra touched'ı ayarla
                setTimeout(() => {
                  formik.setFieldTouched('brandCode', true, false);
                }, 0);
              }}
              onBlur={() => formik.setFieldTouched('brandCode', true, false)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.brandCode && formik.errors.brandCode && !formik.values.brandCode && (
              <div className="pp-error-message">{formik.errors.brandCode}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.year && formik.errors.year ? 'error' : ''}`}>
            <label className="pp-label">Model Yılı</label>
            <Dropdown
              id="year"
              name="year"
              value={formik.values.year}
              options={MODEL_YEAR_OPTIONS}
              onChange={(e: DropdownChangeEvent) => {
                onYearChange(e.value || '');
              }}
              onBlur={() => formik.setFieldTouched('year', true, false)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.year && formik.errors.year && (
              <div className="pp-error-message">{formik.errors.year}</div>
            )}
          </div>

          <div className={`pp-form-group ${(modelError || (formik.touched.modelCode && formik.errors.modelCode && !formik.values.modelCode)) ? 'error' : ''}`}>
            <label className="pp-label">Model</label>
            <Dropdown
              id="modelCode"
              name="modelCode"
              value={formik.values.modelCode}
              options={vehicleModels.map(model => ({
                label: model.text,
                value: model.value
              }))}
              onChange={async (e: DropdownChangeEvent) => {
                if (e.value) {
                  // Değeri string'e çevir
                  const modelCodeValue = String(e.value);
                  await formik.setFieldValue('modelCode', modelCodeValue);
                  const model = vehicleModels.find(m => m.value === e.value);
                  if (model) await formik.setFieldValue('model', model.text);
                } else {
                  await formik.setFieldValue('modelCode', '');
                  await formik.setFieldValue('model', '');
                }
                // Değer set edildikten sonra touched'ı ayarla
                setTimeout(() => {
                  formik.setFieldTouched('modelCode', true, false);
                }, 0);
              }}
              onBlur={() => formik.setFieldTouched('modelCode', true, false)}
              placeholder={isModelsLoading ? 'Yükleniyor...' : 'Seçiniz'}
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              disabled={isModelsLoading || vehicleModels.length === 0}
              showClear={false}
            />
            {modelError && (
              <div className="pp-error-message">{modelError}</div>
            )}
            {!modelError && formik.touched.modelCode && formik.errors.modelCode && !formik.values.modelCode && (
              <div className="pp-error-message">{formik.errors.modelCode}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.usageType && formik.errors.usageType && !formik.values.usageType ? 'error' : ''}`}>
            <label className="pp-label">Kullanım Şekli</label>
            <Dropdown
              id="usageType"
              name="usageType"
              value={formik.values.usageType}
              options={VEHICLE_USAGE_OPTIONS}
              onChange={async (e: DropdownChangeEvent) => {
                await formik.setFieldValue('usageType', e.value);
                setTimeout(() => {
                  formik.setFieldTouched('usageType', true, false);
                }, 0);
              }}
              onBlur={() => formik.setFieldTouched('usageType', true, false)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              filter
              filterPlaceholder="Ara..."
              emptyFilterMessage="Sonuç bulunamadı"
              showClear={false}
            />
            {formik.touched.usageType && formik.errors.usageType && !formik.values.usageType && (
              <div className="pp-error-message">{formik.errors.usageType}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.fuelType && formik.errors.fuelType && !formik.values.fuelType ? 'error' : ''}`}>
            <label className="pp-label">Yakıt Tipi</label>
            <Dropdown
              id="fuelType"
              name="fuelType"
              value={formik.values.fuelType}
              options={FUEL_TYPE_OPTIONS}
              onChange={async (e: DropdownChangeEvent) => {
                await formik.setFieldValue('fuelType', e.value);
                setTimeout(() => {
                  formik.setFieldTouched('fuelType', true, false);
                }, 0);
              }}
              onBlur={() => formik.setFieldTouched('fuelType', true, false)}
              placeholder="Seçiniz"
              className="pp-dropdown"
              showClear={false}
            />
            {formik.touched.fuelType && formik.errors.fuelType && !formik.values.fuelType && (
              <div className="pp-error-message">{formik.errors.fuelType}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.registrationDate && formik.errors.registrationDate ? 'error' : ''}`}>
            <label className="pp-label">Tescil Tarihi</label>
            <input
              type="date"
              className="pp-input"
              id="registrationDate"
              name="registrationDate"
              value={formik.values.registrationDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.registrationDate && formik.errors.registrationDate && (
              <div className="pp-error-message">{formik.errors.registrationDate}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.engineNo && formik.errors.engineNo ? 'error' : ''}`}>
            <label className="pp-label">Motor No</label>
            <input
              type="text"
              className="pp-input"
              id="engineNo"
              name="engineNo"
              value={formik.values.engineNo}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
                  .toLocaleUpperCase('tr-TR')
                  .slice(0, 20);
                formik.setFieldValue('engineNo', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="Motor numarası"
              maxLength={20}
            />
            {formik.touched.engineNo && formik.errors.engineNo && (
              <div className="pp-error-message">{formik.errors.engineNo}</div>
            )}
          </div>

          <div className={`pp-form-group ${formik.touched.chassisNo && formik.errors.chassisNo ? 'error' : ''}`}>
            <label className="pp-label">Şasi No</label>
            <input
              type="text"
              className="pp-input"
              id="chassisNo"
              name="chassisNo"
              value={formik.values.chassisNo}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '')
                  .toLocaleUpperCase('tr-TR')
                  .slice(0, 17);
                formik.setFieldValue('chassisNo', value);
              }}
              onBlur={formik.handleBlur}
              placeholder="17 karakter"
              maxLength={17}
            />
            {formik.touched.chassisNo && formik.errors.chassisNo && (
              <div className="pp-error-message">{formik.errors.chassisNo}</div>
            )}
          </div>

          <div className="pp-form-group">
            <label className="pp-label">Koltuk Adedi</label>
            <input
              type="number"
              className="pp-input"
              id="seatCount"
              name="seatCount"
              value={formik.values.seatCount}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              min="1"
              max="50"
            />
            {formik.touched.seatCount && formik.errors.seatCount && (
              <div className="pp-error-message">{formik.errors.seatCount}</div>
            )}
          </div>
        </div>

        <div className="pp-button-group">
          {vehicleType === 'plated' && (
            <button
              type="button"
              className="pp-btn-back"
              onClick={() => onVehicleDetailsStepChange(0)}
              disabled={isLoading}
            >
              Önceki Adıma Dön
            </button>
          )}
          <button
            type="button"
            className="pp-btn-submit"
            onClick={onSubmitNew}
            disabled={isLoading}
          >
            {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="product-page-form pp-form-wide">
      <div className="pp-card">
        <div className="pp-card-header">
          <span className="pp-title">Araç Bilgileri</span>

          <div className="pp-vehicle-tabs">
            <button
              type="button"
              className={`pp-tab-button ${selectionType === 'existing' ? 'active' : ''}`}
              onClick={() => hasVehicles && onSelectionTypeChange('existing')}
              disabled={!hasVehicles}
            >
              Kayıtlı Araçlarım
            </button>
            <button
              type="button"
              className={`pp-tab-button ${selectionType === 'new' ? 'active' : ''}`}
              onClick={() => onSelectionTypeChange('new')}
            >
              Yeni Araç Ekle
            </button>
          </div>
        </div>

        {isTramerLoading ? (
          <div className="pp-loading-container">
            <div className="pp-spinner"></div>
            <p className="pp-loading-text">Araç bilgileri sorgulanıyor...</p>
          </div>
        ) : (
          <div>
            {selectionType === 'existing' ? renderExistingVehicles() : (
              <>
                {renderNewVehicleForm()}
                {(vehicleType === 'unplated' || vehicleDetailsStep === 1) && renderVehicleDetails()}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleSelectionStep;

