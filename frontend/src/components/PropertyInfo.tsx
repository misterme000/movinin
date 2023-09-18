import React from 'react'
import { strings as cpStrings } from '../lang/property'
import { strings } from '../lang/properties'
import * as Helper from '../common/Helper'
import {
    Tooltip
} from '@mui/material'
import {
    House as PropertyTypeIcon,
    SingleBed as BedroomsIcon,
    Shower as BathroomsIcon,
    AcUnit as AirconIcon,
    Countertops as KitchensIcon,
    DirectionsCar as ParkingSpacesIcon,
    Check as CheckIcon,
    Clear as UncheckIcon,
    Info as InfoIcon,
    Chair as FurnishedIcon,
    Person as MinimumAgeIcon,
    LocationOn as LocationIcon,
    AttachMoney as RentalTermIcon
} from '@mui/icons-material'
import * as movininTypes from 'movinin-types'
import * as LangHelper from '../common/LangHelper'

import '../assets/css/property-info.css'

const PropertyInfo = (
    {
        property,
        description,
        className,
    }
        : {
            property: movininTypes.Property
            description?: boolean
            className?: string
        }
) => {
    const fr = LangHelper.fr()

    const getExtraIcon = (option: string, extra: number) => {
        return extra === -1
            ? <UncheckIcon className="unavailable" />
            : extra === 0
                ? <CheckIcon className="available" />
                : <InfoIcon className="extra-info" />
    }

    return (
        property &&
        <div className={`property-info${className ? ` ${className}` : ''}`}>
            <ul className="property-info-list">
                <li className="property-type">
                    <Tooltip title={Helper.getPropertyType(property.type)} placement="top">
                        <div className="property-info-list-item">
                            <PropertyTypeIcon />
                            <span className="property-info-list-text">{Helper.getPropertyType(property.type)}</span>
                        </div>
                    </Tooltip>
                </li>
                <li className="bedrooms">
                    <Tooltip title={Helper.getBedroomsTooltip(property.bedrooms, fr)} placement="top">
                        <div className="property-info-list-item">
                            <BedroomsIcon />
                            <span className="property-info-list-text">{property.bedrooms}</span>
                        </div>
                    </Tooltip>
                </li>
                <li className="bathrooms">
                    <Tooltip title={Helper.getBathroomsTooltip(property.bathrooms, fr)} placement="top">
                        <div className="property-info-list-item">
                            <BathroomsIcon />
                            <span className="property-info-list-text">{property.bathrooms}</span>
                        </div>
                    </Tooltip>
                </li>
                <li className="kitchens">
                    <Tooltip title={Helper.getKitchensTooltip(property.kitchens)} placement="top">
                        <div className="property-info-list-item">
                            <KitchensIcon />
                            <span className="property-info-list-text">{property.kitchens}</span>
                        </div>
                    </Tooltip>
                </li>
                <li className="parking-spaces">
                    <Tooltip title={Helper.getKParkingSpacesTooltip(property.parkingSpaces, fr)} placement="top">
                        <div className="property-info-list-item">
                            <ParkingSpacesIcon />
                            <span className="property-info-list-text">{property.parkingSpaces}</span>
                        </div>
                    </Tooltip>
                </li>
                {property.furnished && (
                    <li className="aircon">
                        <Tooltip title={strings.FURNISHED_TOOLTIP} placement="top">
                            <div className="property-info-list-item">
                                <FurnishedIcon />
                            </div>
                        </Tooltip>
                    </li>
                )}
                {property.aircon && (
                    <li className="aircon">
                        <Tooltip title={strings.AIRCON_TOOLTIP} placement="top">
                            <div className="property-info-list-item">
                                <AirconIcon />
                            </div>
                        </Tooltip>
                    </li>
                )}
            </ul>
            <ul className="extras-list">
                <li>
                    <Tooltip title={property.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : Helper.getCancellation(property.cancellation, fr)} placement="left">
                        <div className="property-info-list-item">
                            {getExtraIcon('cancellation', property.cancellation)}
                            <span className="property-info-list-text">{Helper.getCancellation(property.cancellation, fr)}</span>
                        </div>
                    </Tooltip>
                </li>
                {property.location.name && (
                    <li>
                        <Tooltip title={property.location.name} placement="left">
                            <div className="property-info-list-item">
                                <LocationIcon />
                                <span className="property-info-list-text">{property.location.name}</span>
                            </div>
                        </Tooltip>
                    </li>
                )}

                <li>
                    <Tooltip title={cpStrings.MINIMUM_AGE} placement="left">
                        <div className="property-info-list-item">
                            <MinimumAgeIcon />
                            <span className="property-info-list-text">{`${property.minimumAge} ${strings.YEARS}`}</span>
                        </div>
                    </Tooltip>
                </li>

                <li>
                    <Tooltip title={cpStrings.RENTAL_TERM} placement="left">
                        <div className="property-info-list-item">
                            <RentalTermIcon />
                            <span className="property-info-list-text">{Helper.rentalTerm(property.rentalTerm)}</span>
                        </div>
                    </Tooltip>
                </li>
                {description && (
                    <li>
                        <div className="property-info-list-item" >
                            <div className="property-info-description"
                                dangerouslySetInnerHTML={{ __html: property.description }}>
                            </div>
                        </div>
                    </li>
                )}
            </ul>
        </div>
        || <></>
    )
}

export default PropertyInfo