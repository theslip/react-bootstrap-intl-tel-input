import React, { Component } from 'react'
import PropTypes from 'prop-types'
import countries from 'country-data'
import { AsYouTypeFormatter, PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import escapeStringRegexp from 'escape-string-regexp'
import FlagIcon from 'react-flag-kit/lib/FlagIcon'
import uuid from 'uuid'

export default class IntlTelInput extends Component {
  constructor () {
    super()
    this.phoneUtil = PhoneNumberUtil.getInstance()
    this.countries = countries.callingCountries.all.filter((country) => country.status === 'assigned')
    this.mouseDownOnMenu = false
    this._pageClick = this.pageClick.bind(this)
    this.missingFlags = { AQ: 'WW', BQ: 'NL', EH: 'WW-AFR', MF: 'FR', SH: 'GB' }
    this.boxShadowStyle = '0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12), 0 5px 5px -3px rgba(0, 0, 0, 0.4)'
    this.bgColorTransitionStyle = 'background-color .25s, color .25s'
    this.state = {
      open: false,
      selectedCountry: {},
      intlPhoneNumber: '',
      phoneNumber: '',
      searchTerm: '',
      valid: false,
      filteredCountries: [],
      preferredCountries: [],
      paginateCount: 1,
      multiSelectOpen: false,
      multiSelectItem: {},
      lastPreferred: '',
      tabbedIndex: -1
    }
  }

  getPreferredCountries () {
    const { preferredCountries } = this.props
    if (preferredCountries && preferredCountries.length) {
      const _preferredCountries = preferredCountries.map((country) => country.toUpperCase())
      const preferred = this.countries.filter((country) => _preferredCountries.indexOf(country.alpha2) !== -1).reverse()
      const regular = this.countries.filter((country) => _preferredCountries.indexOf(country.alpha2) === -1)
      const orderedCountries = preferred.concat(regular)
      this.setState({ preferredCountries: orderedCountries, lastPreferred: preferred[preferred.length - 1] })
      return orderedCountries
    }
  }

  mapErrorMessage (message) {
    const { minLengthMessage, maxLengthMessage, callingCodeMessage, catchAllMessage } = this.props
    if (message === 'The string supplied did not seem to be a phone number' || message === 'The string supplied is too short to be a phone number' || message === 'Phone number too short after IDD') {
      return minLengthMessage
    } else if (message === 'The string supplied is too long to be a phone number') {
      return maxLengthMessage
    } else if (message === 'Invalid country calling code') {
      return callingCodeMessage
    } else {
      return catchAllMessage
    }
  }

  formatValidation (valid, internalMessage, friendlyMessage, parsed, intlPhoneNumber) {
    return {
      valid,
      internalMessage,
      friendlyMessage,
      parsed,
      intlPhoneNumber
    }
  }

  validateNumber (alpha2, phoneNumber) {
    if (alpha2) {
      const _alpha2 = alpha2 === 'unknown' ? '' : alpha2
      try {
        this.phoneUtil.parse(phoneNumber, _alpha2)
      } catch (e) {
        const { message } = e
        return this.formatValidation(false, message, this.mapErrorMessage(message), null, null)
      }
      const { validMessage } = this.props
      const parsed = this.phoneUtil.parse(phoneNumber, _alpha2)
      const valid = this.phoneUtil.isPossibleNumber(parsed)
      const intlPhoneNumber = this.phoneUtil.format(parsed, PhoneNumberFormat.INTERNATIONAL)
      return this.formatValidation(valid, '', valid ? validMessage : this.mapErrorMessage(), parsed, intlPhoneNumber)
    } else {
      const { callingCodeMessage } = this.props
      return this.formatValidation(false, '', callingCodeMessage, null, null)
    }
  }

  onKeyDown (e) {
    const { tabbedIndex, paginateCount, open, filteredCountries } = this.state
    if (open) {
      const dropdownItemHeight = parseInt(window.getComputedStyle(this.countryDropdown.children[0]).getPropertyValue('height'))
      const dropdownHeight = parseInt(window.getComputedStyle(this.countryDropdown).getPropertyValue('height'))
      const halfwayPoint = (dropdownHeight / dropdownItemHeight) / 2
      const { paginate } = this.props
      const key = e.key
      if (key === 'Escape') {
        this.setState({ open: false, tabbedIndex: -1 })
      } else if (key === 'ArrowDown' || (key === 'Tab' && !e.shiftKey)) {
        e.preventDefault()
        const newIndex = tabbedIndex === filteredCountries.length ? filteredCountries.length : tabbedIndex + 1
        this.setState({ tabbedIndex: newIndex }, () => {
          this.countryDropdown.scrollTop = (dropdownItemHeight * (newIndex - halfwayPoint))
          if (paginate && paginateCount && ((paginate * paginateCount) === (newIndex - 2))) {
            this.setState({ paginateCount: paginateCount + 1 })
          }
        })
      } else if (key === 'ArrowUp' || (key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        const newIndex = tabbedIndex === 0 ? 0 : tabbedIndex - 1
        this.setState({ tabbedIndex: newIndex }, () => {
          this.countryDropdown.scrollTop = (dropdownItemHeight * (newIndex - halfwayPoint))
        })
      } else if (key === 'Enter' || e.keyCode === 32 || e.which === 32) {
        if (tabbedIndex) {
          const { filteredCountries } = this.state
          this.selectCountry(filteredCountries[tabbedIndex - 1], false, false, true)
        }
      }
    }
  }

  lookupCountry (callingCode) {
    return callingCode.toString().trim() === '1' ? countries.countries.US : countries.lookup.countries({ countryCallingCodes: `+${callingCode}` }).filter((country) => country.status === 'assigned')[0]
  }

  testNumber (number) {
    return new RegExp(/^[0-9]+$/).test(number)
  }

  unformatNumber (number) {
    const _number = !isNaN(number) ? number.toString() : number
    return _number ? _number.replace(/[^0-9]/g, '') : number
  }

  getNationalNumber (alpha2, number) {
    return number && alpha2 && alpha2.length ? number.substr(alpha2.length + 1) : ''
  }

  formatNumber (alpha2, number) {
    const unformattedNumber = this.unformatNumber(unformattedNumber)
    const formatter = new AsYouTypeFormatter(alpha2)
    const formattedNumberArray = `+${number}`.split('').map((char) => formatter.inputDigit(char))
    const intlPhoneNumber = formattedNumberArray.length ? formattedNumberArray[formattedNumberArray.length - 1] : unformattedNumber
    formatter.clear()
    return intlPhoneNumber
  }

  onChangeCallback (country) {
    if (country) {
      this.selectCountry(country)
    }
  }

  onChangePhone (value = '') {
    const { selectedCountry, callingCode } = this.state
    const unformattedNumber = this.unformatNumber(value)
    const lookupCountry = this.lookupCountry(value.replace('+', ''))
    const country = lookupCountry || Object.keys(selectedCountry).length > 0 && selectedCountry
    if (this.testNumber(unformattedNumber) && value !== callingCode) {
      if (country) {
        const { alpha2 } = country
        const intlPhoneNumber = this.formatNumber(alpha2, unformattedNumber)
        const phoneNumber = this.getNationalNumber(alpha2, intlPhoneNumber)
        const validation = this.validateNumber(alpha2, intlPhoneNumber)
        const { friendlyMessage, valid } = validation
        this.setState({ intlPhoneNumber, phoneNumber, message: friendlyMessage, valid }, () => this.onChangeCallback(country))
      }
    } else if (unformattedNumber.length < 1) {
      this.setState({ intlPhoneNumber: unformattedNumber }, () => () => this.onChangeCallback(country))
    } else {
      this.setState({ intlPhoneNumber: value }, () => () => this.onChangeCallback(country))
    }
  }

  cancelMultiSelect () {
    this.setState({ multiSelectOpen: false, multiSelectItem: {} }, () => {
      this.multiSelect.style.zIndex = '-1'
    })
  }

  onChangeTypeAhead (value) {
    const { preferredCountries, searchTerm } = this.state
    const filteredCountries = this.countries.filter((country) => {
      const { name, countryCallingCodes } = country
      const searchCriteria = `${name} ${countryCallingCodes.join(' ')}`
      return new RegExp(escapeStringRegexp(value.trim()), 'gi').test(searchCriteria)
    })
    this.setState({ filteredCountries: value.trim() === '' ? preferredCountries : filteredCountries, searchTerm: value, tabbedIndex: -1 })
  }

  selectCountry (country, mounted = false, multiSelect = false, onClick = false) {
    const { onChange } = this.props
    const { countryCallingCodes, alpha2 } = country
    const { intlPhoneNumber, phoneNumber, searchTerm } = this.state
    if (countryCallingCodes && countryCallingCodes.length > 1 && !multiSelect) {
      return this.setState({ multiSelectOpen: true, multiSelectItem: country }, () => {
        this.multiSelect.style.zIndex = '101'
      })
    }
    const callingCode = multiSelect || (countryCallingCodes && countryCallingCodes[0])
    const _intlPhoneNumber = mounted ? intlPhoneNumber : this.formatNumber(alpha2, this.unformatNumber(`${callingCode}${phoneNumber}`))
    const validation = this.validateNumber(alpha2, _intlPhoneNumber)
    this.setState({ selectedCountry: country, callingCode, open: false, tabbedIndex: -1, searchTerm: searchTerm.trim() }, () => {
      if (onClick) {
        this.setState({ intlPhoneNumber: _intlPhoneNumber })
      }
      this.cancelMultiSelect()
      if (!mounted) {
        this.phoneInput.focus()
        if (onChange) {
          onChange({ ...country, ...validation, callingCode, phoneNumber, intlPhoneNumber: _intlPhoneNumber })
        }
      }
    })
  }

  pageClick () {
    if (!this.mouseDownOnMenu) {
      this.setState({ open: false, tabbedIndex: -1 }, () => {
        this.countryDropdown.scrollTop = 0
      })
      this.cancelMultiSelect()
    }
  }

  onOpenHandler () {
    const { disabled } = this.props
    if (!disabled) {
      const { open } = this.state
      this.setState({ open: !open })
      if (!open) {
        this.phoneInput.focus()
      } else {
        this.setState({ tabbedIndex: -1 })
      }
    }
  }

  clearInput () {
    const { open, selectedCountry, callingCode } = this.state
    if (open) {
      this.setState({ searchTerm: '', filteredCountries: this.getPreferredCountries(), multiSelectItem: [], multiSelectOpen: false })
    } else if (selectedCountry === 'unknown') {
      this.setState({ intlPhoneNumber: '', phoneNumber: '' })
      this.onChangePhone('')
    } else {
      this.setState({ intlPhoneNumber: '', phoneNumber: '' })
      this.cancelMultiSelect()
    }
    this.phoneInput.focus()
  }

  mouseDownHandler () {
    this.mouseDownOnMenu = true
  }

  mouseUpHandler () {
    this.mouseDownOnMenu = false
  }

  getBgColor (index, selected) {
    const { tabbedIndex, hoverIndex } = this.state
    const hovered = index === hoverIndex
    const tabbed = index === tabbedIndex
    if (tabbed) {
      return '#EBEBEB'
    } else if (selected && hovered) {
      return '#BBDEF8'
    } else if (selected) {
      return '#E3F2FD'
    } else if (hovered) {
      return '#EBEBEB'
    }
  }

  propChangeHandler (props, mounted, reset) {
    const { selectedCountry } = this.state
    const { defaultCountry, defaultValue } = props
    const countryNotSelected = Object.keys(selectedCountry).length < 1 && selectedCountry !== 'unknown'
    if (defaultValue) {
      const { intlPhoneNumber, parsed } = this.validateNumber('unknown', defaultValue)
      if (intlPhoneNumber) {
        this.setState({ intlPhoneNumber, phoneNumber: parsed.getNationalNumber().toString() }, () => {
          this.selectCountry(this.lookupCountry(parsed.getCountryCode()), mounted || reset)
        })
      } else {
        this.setState({ intlPhoneNumber: defaultValue, selectedCountry: 'unknown' })
      }
    } else if (defaultCountry && countryNotSelected) {
      this.setState({ intlPhoneNumber: '', phoneNumber: '' }, () => {
        this.selectCountry(countries.countries[defaultCountry], mounted || reset)
      })
    }
  }

  componentWillReceiveProps (nextProps) {
    const { reset, defaultValue } = nextProps
    if (reset || (this.props.defaultValue !== defaultValue)) {
      this.propChangeHandler(nextProps, false, reset)
    }
  }

  componentDidMount () {
    window.addEventListener('mousedown', this._pageClick)
    this.propChangeHandler(this.props, true)
    this.setState({ filteredCountries: this.getPreferredCountries() })
  }

  componentWillUnmount () {
    window.removeEventListener('mousedown', this._pageClick)
  }

  render () {
    const { open, selectedCountry, intlPhoneNumber, filteredCountries, searchTerm, paginateCount, multiSelectOpen, multiSelectItem, lastPreferred, tabbedIndex, message, valid, hover } = this.state
    const { noResultsMessage, className, removeToken, paginate, paginateText, placeholder, maxHeight, disabled, inputClassName, callingCodeDivider } = this.props
    const { alpha2 } = selectedCountry
    const inputID = uuid.v4()
    const tabbedCountry = filteredCountries.length > 0 && filteredCountries[0].alpha2
    const flag = (this.missingFlags[alpha2] ? this.missingFlags[alpha2] : selectedCountry !== 'unknown' && Object.keys(selectedCountry).length > 0 && alpha2.toUpperCase()) || 'WW'
    return (
      <div
        style={{position: 'relative', boxShadow: open ? this.boxShadowStyle : null}}
        ref={(input) => { this.intlPhoneInput = input }}
        className={`intl-phone-input${open ? ' open' : ''}`}
        onMouseDown={() => this.mouseDownHandler()}
        onMouseUp={() => this.mouseUpHandler()}>
        <div className='input-group'>
          <div className='input-group-btn'>
            <button
              type='button'
              tabIndex={0}
              disabled={disabled}
              aria-hidden
              style={{borderBottomLeftRadius: open ? 0 : null, transition: this.bgColorTransitionStyle, cursor: disabled ? null : 'pointer'}}
              className='btn btn-secondary btn-primary dropdown-toggle country-selector'
              onClick={(e) => this.onOpenHandler(e)}>
              {flag && <FlagIcon code={flag} size={24} className='flag-icon' />}
            </button>
          </div>
          {((open && searchTerm.length > 0) || (!open && intlPhoneNumber.length > 0)) && !disabled &&
            <span
              aria-hidden='true'
              className='remove-token-container'
              style={{position: 'absolute', userSelect: 'none', zIndex: 10, fontSize: 26, right: 15, cursor: 'pointer'}}>
              <span style={{cursor: 'pointer'}} onClick={() => this.clearInput()}>{removeToken}</span>
            </span>
          }
          <label htmlFor={inputID} aria-hidden={!open} className='sr-only'>Please enter your country's calling code followed by your phone number</label>
          <div id='validation-info' aria-hidden={!open} aria-live='assertive' className='sr-only'>
            {message}. {(Object.keys(selectedCountry).length > 0 && selectedCountry.name) ? `You have entered a calling code for ${selectedCountry.name}.` : ''}
          </div>
          <input
            id={inputID}
            autoComplete={'off'}
            aria-describedby={'validation-info'}
            type='text'
            ref={(input) => { this.phoneInput = input }}
            className={`form-control phone-input${inputClassName ? inputClassName : ''}`}
            style={{paddingRight: 38, borderBottomLeftRadius: open ? 0 : null, borderBottomRightRadius: open ? 0 : null}}
            placeholder={open ? placeholder : ''}
            onKeyDown={(e) => this.onKeyDown(e)}
            value={open ? searchTerm : intlPhoneNumber}
            disabled={disabled}
            onChange={(e) => open ? this.onChangeTypeAhead(e.target.value) : this.onChangePhone(e.target.value)}
          />
        </div>
        <ul
          aria-hidden
          tabIndex={-1}
          ref={(dropdown) => { this.countryDropdown = dropdown }}
          className='dropdown-menu country-dropdown'
          style={{display: 'block', zIndex: 101, overflowX: 'scroll', marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, maxHeight: open ? maxHeight : 0, boxShadow: open ? this.boxShadowStyle : null, borderWidth: open ? 1 : 0, padding: open ? '10px 0 10px 0' : 0, transition: 'all 0.2s ease', width: '100%', borderTop: 'none'}}>
          {filteredCountries && filteredCountries.length > 0 && filteredCountries.map((country, index) => {
            const { name, alpha2, countryCallingCodes } = country
            const paginateTo = paginate && parseInt(paginate) * paginateCount
            if (index <= paginateTo) {
              return (
                <li
                  id={alpha2}
                  tabIndex={0}
                  onMouseEnter={() => this.setState({ hoverIndex: index })}
                  onMouseLeave={() => this.setState({ hoverIndex: NaN })}
                  className={`dropdown-item${tabbedIndex === index + 1 ? ' tabbed' : ''}`}
                  key={`${alpha2}-${index}`}
                  style={{padding: 15, cursor: 'pointer', borderBottom: lastPreferred && lastPreferred.alpha2 === alpha2 && searchTerm === '' ? '1px solid #c1c1c1' : '', transition: this.bgColorTransitionStyle, backgroundColor: this.getBgColor(index, alpha2 === selectedCountry.alpha2)}}
                  onClick={() => this.selectCountry(country, false, false, true)}>
                  <h6 style={{margin: 0}}>
                    <FlagIcon style={{marginRight: 10}} code={this.missingFlags[alpha2] ? this.missingFlags[alpha2] : alpha2} size={30} />
                    {name}&nbsp;
                    {countryCallingCodes.map((code, index) => {
                      return (
                        <small className='text-muted' key={code}>
                          {code}
                          {index !== countryCallingCodes.length - 1 && <span key={`${code}-divider`}>{callingCodeDivider}</span>}
                        </small>
                      )
                    })}
                  </h6>
                </li>
              )
            }
            if (index - 1 === paginateTo) {
              return (
                <div
                  className='dropdown-item'
                  aria-hidden
                  style={{padding: 15, cursor: 'pointer', transition: this.bgColorTransitionStyle}}
                  key={`addit-results-${index}`}
                  onClick={() => this.setState({ paginateCount: paginateCount + 1 })}>
                  {paginateText}
                </div>
              )
            }
          })}
          {filteredCountries && filteredCountries.length === 0 &&
            <div style={{padding: 15, cursor: 'pointer', transition: this.bgColorTransitionStyle}} className='dropdown-item'>
              {noResultsMessage}
            </div>
          }
          <div
            ref={(select) => { this.multiSelect = select }}
            aria-hidden={!multiSelectOpen}
            className={`text-center calling-code-multi-select${multiSelectOpen ? ' open' : ''}`}
            style={{opacity: multiSelectOpen ? 1 : 0, zIndex: multiSelectOpen ? 'auto' : -1, transition: 'all 0.2s ease', backgroundColor: 'white', position: 'absolute', top: 0, left: 0, height: '100%', width: '100%'}}>
            <button
              type='button'
              aria-hidden={!multiSelectOpen}
              aria-label='close'
              onClick={() => this.cancelMultiSelect()}
              style={{position: 'absolute', left: 10, bottom: 10}}
              className='btn btn-outline btn-outline-danger multi-select-back-btn'>
              Close
            </button>
            {Object.keys(multiSelectItem).length > 0 && multiSelectItem.countryCallingCodes.map((item) => {
              return (
                <button
                  key={item}
                  type='button'
                  onClick={() => this.selectCountry(multiSelectItem, false, item, true)}
                  style={{position: 'relative', top: '50%', transform: 'perspective(1px) translateY(-50%)', marginLeft: 8, verticalAlign: 'middle'}}
                  className='btn btn-secondary'>
                  {item}
                </button>
              )
            })}
          </div>
        </ul>
      </div>
    )
  }
}

IntlTelInput.defaultProps = {
  removeToken: <span>&times;</span>,
  noResultsMessage: 'No results available',
  paginateText: 'Display additional results...',
  paginate: 50,
  placeholder: 'Search for a calling code by country name',
  maxHeight: 300,
  defaultCountry: 'US',
  disabled: false,
  minLengthMessage: 'Too short to be a valid phone number',
  maxLengthMessage: 'Too long to be a valid phone number',
  callingCodeMessage: 'Please select a valid country code',
  catchAllMessage: 'Not a valid phone number',
  validMessage: 'This phone number is valid',
  callingCodeDivider: <span style={{marginLeft: 4, marginRight: 4}}>/</span>
}

IntlTelInput.propTypes = {
  removeToken: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string
  ]),
  preferredCountries: PropTypes.arrayOf(PropTypes.string),
  defaultValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  noResultsMessage: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string
  ]),
  paginateText: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string
  ]),
  callingCodeDivider: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.string
  ]),
  paginate: PropTypes.number,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  maxHeight: PropTypes.number,
  defaultCountry: PropTypes.string,
  onChange: PropTypes.func,
  minLengthMessage: PropTypes.string,
  maxLengthMessage: PropTypes.string,
  callingCodeMessage: PropTypes.string,
  catchAllMessage: PropTypes.string,
  inputClassName: PropTypes.string,
  validMessage: PropTypes.string
}
