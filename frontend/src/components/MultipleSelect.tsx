import React, { useState, useEffect, forwardRef, useRef, useImperativeHandle } from 'react'
import {
  Autocomplete,
  TextField,
  InputAdornment,
  Avatar,
  SxProps,
  Theme,
  TextFieldVariants,
  AutocompleteInputChangeReason
} from '@mui/material'
import { LocationOn as LocationIcon, AccountCircle } from '@mui/icons-material'
import * as movininTypes from 'movinin-types'
import * as movininHelper from 'movinin-helper'
import Env from '../config/env.config'

import '../assets/css/multiple-select.css'

interface MultipleSelectProps {
  label?: string
  reference?: any
  selectedOptions?: any[]
  key?: string
  required?: boolean
  options?: any[]
  ListboxProps?: (React.HTMLAttributes<HTMLUListElement> & {
    sx?: SxProps<Theme> | undefined
    ref?: React.Ref<Element> | undefined
  }),
  loading?: boolean
  multiple?: boolean
  type: string
  variant?: TextFieldVariants
  readOnly?: boolean
  hidePopupIcon?: boolean
  customOpen?: boolean
  freeSolo?: boolean
  callbackFromMultipleSelect?: (newValue: any, _key: string, _reference: any) => void
  onFocus?: React.FocusEventHandler<HTMLDivElement>
  onInputChange?: ((event: React.SyntheticEvent<Element, Event>, value?: string, reason?: AutocompleteInputChangeReason) => void) | undefined
  onClear?: () => void
  onOpen?: ((event: React.SyntheticEvent<Element, Event>) => void) | undefined
}

const ListBox: React.ComponentType<React.HTMLAttributes<HTMLElement>> = forwardRef((props, ref) => {
  const { children, ...rest }: { children?: React.ReactNode } = props

  const innerRef = useRef(null)

  useImperativeHandle(ref, () => innerRef.current)

  return (
    // eslint-disable-next-line
    <ul {...rest} ref={innerRef} role="list-box">
      {children}
    </ul>
  )
})

const MultipleSelect = ({
  label,
  reference,
  selectedOptions,
  key,
  required,
  options,
  ListboxProps,
  loading,
  multiple,
  type,
  variant,
  readOnly,
  hidePopupIcon,
  customOpen,
  freeSolo,
  callbackFromMultipleSelect,
  onFocus,
  onInputChange,
  onClear,
  onOpen
}: MultipleSelectProps) => {
  const [init, setInit] = React.useState(Array.isArray(selectedOptions) && selectedOptions.length === 0)
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<any[]>([])
  const [inputValue, setInputValue] = useState('')

  if (!options) {
    options = []
  }

  useEffect(() => {
    if (selectedOptions) {
      setValues(selectedOptions)
    }
    if (selectedOptions && selectedOptions.length === 0) {
      setInputValue('')
    }
  }, [selectedOptions, type])

  return (
    <div className="multiple-select">
      <Autocomplete
        open={customOpen ? open : undefined}
        readOnly={readOnly}
        options={options}
        value={multiple ? values : values.length > 0 ? values[0] : null}
        getOptionLabel={(option) => (option && option.name) || ''}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        inputValue={inputValue}
        onInputChange={(event, value) => {
          if (init) {
            if (!event) {
              setInputValue(value)
              setOpen(false)
              return
            }

            if (value.length === 0) {
              if (open) {
                setOpen(false)
              }
            } else if (!open) {
              setOpen(true)
            }
          } else {
            setInit(true)
          }

          setInputValue(value)
          if (onInputChange) {
            onInputChange(event)
          }
        }}
        onChange={(event: React.SyntheticEvent<Element, Event>, newValue: any) => {
          if (event && event.type === 'keydown' && 'key' in event && event.key === 'Enter') {
            return
          }
          key = key || ''
          if (multiple) {
            setValues(newValue)
            if (callbackFromMultipleSelect) {
              callbackFromMultipleSelect(newValue, key, reference)
            }
            if (newValue.length === 0 && onClear) {
              onClear()
            }
          } else {
            const value = (newValue && [newValue]) || []
            setValues(value)
            if (callbackFromMultipleSelect) {
              callbackFromMultipleSelect(value, key, reference)
            }
            if (!newValue) {
              if (onClear) {
                onClear()
              }
            }
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
          }
        }}
        clearOnBlur={false}
        clearOnEscape={false}
        loading={loading}
        multiple={multiple}
        freeSolo={freeSolo}
        handleHomeEndKeys={false}
        popupIcon={hidePopupIcon ? null : undefined}
        renderInput={(params) => {
          const { inputProps } = params
          inputProps.autoComplete = 'off'

          if (type === movininTypes.RecordType.User && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        {option.image ? (
                          <Avatar src={movininHelper.joinURL(Env.CDN_USERS, option.image)} className="avatar-small suo" />
                        ) : (
                          <AccountCircle className="avatar-small suo" color="disabled" />
                        )}
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Agency && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <div className="agency-ia">
                          <img
                            src={movininHelper.joinURL(Env.CDN_USERS, option.image)}
                            alt={option.name}
                            style={{ height: Env.AGENCY_IMAGE_HEIGHT }}
                          />
                        </div>
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Location && !multiple && values.length === 1 && values[0]) {
            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <LocationIcon />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          if (type === movininTypes.RecordType.Property && !multiple && values.length === 1 && values[0]) {
            const option = values[0]

            return (
              <TextField
                {...params}
                label={label}
                variant={variant || 'outlined'}
                required={required}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <img
                          src={movininHelper.joinURL(Env.CDN_PROPERTIES, option.image)}
                          alt={option.name}
                          style={{
                            height: Env.SELECTED_PROPERTY_OPTION_IMAGE_HEIGHT,
                          }}
                        />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )
          }

          return (
            <TextField
              {...params}
              label={label}
              variant={variant || 'outlined'}
              required={required && values && values.length === 0}
            />
          )
        }}
        onClose={() => {
          setOpen(false)
        }}
        renderOption={(props, option) => {
          if (type === movininTypes.RecordType.User) {
            return (
              <li {...props} className={`${props.className} ms-option`}>
                <span className="option-image">
                  {option.image ? <Avatar src={movininHelper.joinURL(Env.CDN_USERS, option.image)} className="avatar-medium" /> : <AccountCircle className="avatar-medium" color="disabled" />}
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Agency) {
            return (
              <li {...props} className={`${props.className} ms-option`}>
                <span className="option-image agency-ia">
                  <img
                    src={movininHelper.joinURL(Env.CDN_USERS, option.image)}
                    alt={option.name}
                    style={{ height: Env.AGENCY_IMAGE_HEIGHT }}
                  />
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Location) {
            return (
              <li {...props} className={`${props.className} ms-option`}>
                <span className="option-image">
                  <LocationIcon />
                </span>
                <span className="option-name">{option.name}</span>
              </li>
            )
          } if (type === movininTypes.RecordType.Property) {
            return (
              <li {...props} className={`${props.className} ms-option`}>
                <span className="option-image property-ia">
                  <img
                    src={movininHelper.joinURL(Env.CDN_PROPERTIES, option.image)}
                    alt={option.name}
                    style={{
                      height: Env.PROPERTY_OPTION_IMAGE_HEIGHT,
                    }}
                  />
                </span>
                <span className="property-option-name">{option.name}</span>
              </li>
            )
          }

          return (
            <li {...props} className={`${props.className} ms-option`}>
              <span>{option.name}</span>
            </li>
          )
        }}
        ListboxProps={ListboxProps || undefined}
        onFocus={onFocus || undefined}
        ListboxComponent={ListBox}
        onOpen={onOpen || undefined}
      />
    </div>
  )
}

export default MultipleSelect
