import React, { Component, PropTypes } from 'react'
import countries from 'country-data'
import { AsYouTypeFormatter, PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber'
import escapeStringRegexp from 'escape-string-regexp'
import FlagIcon from 'react-flag-kit/lib/FlagIcon'

export default class IntlTelInput extends Component {
  constructor () {
    super()
    this.phoneUtil = PhoneNumberUtil.getInstance()
    this.countries = countries.callingCountries.all.filter((country) => country.status === 'assigned')
    this.mouseDownOnMenu = false
    this._pageClick = this.pageClick.bind(this)
    this.missingFlags = { AQ: 'WW', BQ: 'NL', EH: 'WW-AFR', MF: 'FR', SH: 'GB' }
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
      tabbedIndex: 1
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
        this.setState({ open: false, tabbedIndex: 0 })
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
    return number ? number.replace(/[^0-9]/g, '') : number
  }

  getNationalNumber (alpha2, number) {
    return number ? number.substr(alpha2.length + 1) : ''
  }

  formatNumber (alpha2, number) {
    const unformattedNumber = this.unformatNumber(unformattedNumber)
    const formatter = new AsYouTypeFormatter(alpha2)
    const formattedNumberArray = `+${number}`.split('').map((char) => formatter.inputDigit(char))
    const intlPhoneNumber = formattedNumberArray.length ? formattedNumberArray[formattedNumberArray.length - 1] : unformattedNumber
    formatter.clear()
    return intlPhoneNumber
  }

  onChangePhone (value = '') {
    // const { onChange } = this.props
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
        this.setState({ intlPhoneNumber, phoneNumber, message: friendlyMessage, valid })
      }
    } else if (unformattedNumber.length < 1) {
      this.setState({ intlPhoneNumber: unformattedNumber })
    } else {
      this.setState({ intlPhoneNumber: value })
    }
    if (country) {
      this.selectCountry(country)
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
    }).sort((a, b) => a.name.length - b.name.length)
    this.setState({ filteredCountries: value === '' ? preferredCountries : filteredCountries, searchTerm: value, tabbedIndex: 0 })
  }

  selectCountry (country, mounted = false, multiSelect = false, formatOnly = false) {
    const { onChange } = this.props
    const { countryCallingCodes, alpha2 } = country
    const { intlPhoneNumber, phoneNumber, searchTerm } = this.state
    if (countryCallingCodes.length > 1 && !multiSelect) {
      return this.setState({ multiSelectOpen: true, multiSelectItem: country }, () => {
        this.multiSelect.style.zIndex = '101'
      })
    }
    const callingCode = multiSelect || countryCallingCodes[0]
    const validation = this.validateNumber(alpha2, intlPhoneNumber)
    this.setState({ selectedCountry: country, callingCode, open: false, tabbedIndex: 0, searchTerm: searchTerm.trim() }, () => {
      this.cancelMultiSelect()
      if (formatOnly) {
        this.setState({ intlPhoneNumber: mounted ? intlPhoneNumber : this.formatNumber(alpha2, this.unformatNumber(`${callingCode}${phoneNumber}`)) })
      }
      if (!mounted) {
        this.phoneInput.focus()
        if (onChange) {
          onChange({ ...country, ...validation, callingCode })
        }
      }
    })
  }

  pageClick () {
    if (!this.mouseDownOnMenu) {
      this.setState({ open: false, tabbedIndex: 0 }, () => {
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

  propChangeHandler (props, mounted, reset) {
    const { selectedCountry } = this.state
    const { defaultCountry, defaultValue } = props
    const countryNotSelected = Object.keys(selectedCountry).length < 1 && selectedCountry !== 'unknown'
    if (defaultValue) {
      const { intlPhoneNumber, parsed } = this.validateNumber('unknown', defaultValue)
      if (intlPhoneNumber) {
        this.setState({ intlPhoneNumber, phoneNumber: parsed.getNationalNumber() }, () => {
          this.selectCountry(this.lookupCountry(parsed.getCountryCode()), mounted)
        })
      } else {
        this.setState({ intlPhoneNumber: defaultValue, selectedCountry: 'unknown' })
      }
    } else if (defaultCountry && countryNotSelected) {
      this.setState({ intlPhoneNumber: '', phoneNumber: '' }, () => {
        this.selectCountry(countries.countries[defaultCountry], mounted)
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
    const { open, selectedCountry, intlPhoneNumber, filteredCountries, searchTerm, paginateCount, multiSelectOpen, multiSelectItem, lastPreferred, tabbedIndex, message, valid } = this.state
    const { noResultsMessage, className, removeToken, paginate, paginateText, placeholder, maxHeight, disabled, containerClassName, inputClassName, inputID, dropdownID } = this.props
    const { alpha2 } = selectedCountry
    const tabbedCountry = filteredCountries.length > 0 && filteredCountries[0].alpha2
    const flag = (this.missingFlags[alpha2] ? this.missingFlags[alpha2] : selectedCountry !== 'unknown' && Object.keys(selectedCountry).length > 0 && alpha2.toUpperCase()) || 'WW'
    return (
      <div ref={(input) => { this.intlPhoneInput = input }} className={`${containerClassName ? containerClassName : '' }intl-phone-input${open ? ' open' : ''}`} onMouseDown={() => this.mouseDownHandler()} onMouseUp={() => this.mouseUpHandler()}>
        <div className='input-group'>
          <div className='input-group-btn'>
            <button
              type='button'
              tabIndex={0}
              disabled={disabled}
              aria-hidden={true}
              className='btn btn-secondary dropdown-toggle country-selector'
              onClick={(e) => this.onOpenHandler(e)}>
              {flag && <FlagIcon code={flag} size={24} className='flag-icon' />}
            </button>
          </div>
          {((open && searchTerm.length > 0) || (!open && intlPhoneNumber.length > 0)) && !disabled &&
            <span aria-hidden='true' className='remove-token-container'>
              <span style={{cursor: 'pointer'}} onClick={() => this.clearInput()}>{removeToken}</span>
            </span>
          }
          <label htmlFor={inputID} aria-hidden={!open} className='sr-only'>Please enter your country's calling code followed by your phone number</label>
          <div id='validation-info' aria-hidden={!open} aria-live='polite' className='sr-only'>
            {message}. {Object.keys(selectedCountry).length > 0 ? `You have entered a calling code for ${selectedCountry.name}.` : ''}
          </div>
          <input
            id={inputID}
            autoComplete={'off'}
            aria-describedby={'validation-info'}
            type='text'
            ref={(input) => { this.phoneInput = input }}
            className={`form-control phone-input${inputClassName ? inputClassName : ''}`}
            placeholder={open ? placeholder : ''}
            onKeyDown={(e) => this.onKeyDown(e)}
            value={open ? searchTerm : intlPhoneNumber}
            disabled={disabled}
            onChange={(e) => open ? this.onChangeTypeAhead(e.target.value) : this.onChangePhone(e.target.value)}
          />
        </div>
        <ul id={dropdownID} aria-hidden={true} tabIndex={-1} ref={(dropdown) => { this.countryDropdown = dropdown }} className='dropdown-menu country-dropdown' style={{maxHeight: open ? maxHeight : 0}}>
          {filteredCountries && filteredCountries.length > 0 && filteredCountries.map((country, index) => {
            const { name, alpha2, countryCallingCodes } = country
            const paginateTo = paginate && parseInt(paginate) * paginateCount
            if (index <= paginateTo) {
              return (
                <li
                  id={alpha2}
                  tabIndex={0}
                  className={`dropdown-item${lastPreferred && lastPreferred.alpha2 === alpha2 && searchTerm === '' ? ' preferred' : ''}${alpha2 === selectedCountry.alpha2 ? ' selected' : ''}${tabbedIndex === index + 1 ? ' tabbed' : ''}`}
                  key={`${alpha2}-${index}`}
                  onClick={() => this.selectCountry(country, false, false, true)}>
                  <h6 style={{margin: 0}}>
                    <FlagIcon style={{marginRight: 10}} code={this.missingFlags[alpha2] ? this.missingFlags[alpha2] : alpha2} size={30} />
                    {name}&nbsp;
                    {countryCallingCodes.map((code, index) => {
                      return (
                        <small className='text-muted' key={code}>
                          {code}
                          {index !== countryCallingCodes.length - 1 && <span key={`${code}-divider`} className='country-code-divider' />}
                        </small>
                      )
                    })}
                  </h6>
                </li>
              )
            }
            if (index - 1 === paginateTo) {
              return (
                <div className='dropdown-item' aria-hidden key={`addit-results-${index}`} onClick={() => this.setState({ paginateCount: paginateCount + 1 })}>
                  {paginateText}
                </div>
              )
            }
          })}
          {filteredCountries && filteredCountries.length === 0 &&
            <div className='dropdown-item'>
              {noResultsMessage}
            </div>
          }
          <div ref={(select) => { this.multiSelect = select }} aria-hidden={!multiSelectOpen} className={`text-center calling-code-multi-select${multiSelectOpen ? ' open' : ''}`}>
            <button role='button' type='button' aria-hidden={!multiSelectOpen} aria-label='close' onClick={() => this.cancelMultiSelect()} className='btn btn-outline btn-outline-danger multi-select-back-btn'>
              Close
            </button>
            {Object.keys(multiSelectItem).length > 0 && multiSelectItem.countryCallingCodes.map((item) => <button key={item} role='button' type='button' onClick={() => this.selectCountry(multiSelectItem, false, item)} className='btn btn-secondary country-btn'>{item}</button>)}
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
  minLengthMessage: 'Too short to be a valid phone number',
  maxLengthMessage: 'Too long to be a valid phone number',
  callingCodeMessage: 'Please select a country code',
  catchAllMessage: 'Not a valid phone number',
  validMessage: 'This phone number is valid',
  inputID: 'intl-tel-input',
  dropdownID: 'country-selector-dropdown'
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
  noResultsMessage: PropTypes.string,
  paginateText: PropTypes.string,
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
  containerClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  validMessage: PropTypes.string,
  inputID: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  dropdownID: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ])
}
