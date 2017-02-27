# react-bootstrap-intl-tel-input
React international telephone input built on bootstrap v4

<img src="https://github.com/theslip/react-bootstrap-intl-tel-input/raw/master/src/demo.gif" alt="Demo" width="380" />

### Install
```
npm i react-bootstrap-intl-tel-input --save
```

### Usage
```javascript
import IntlTelInput from 'react-bootstrap-intl-tel-input'

<IntlTelInput
  preferredCountries={['US', 'GB']}
  defaultCountry={'US'}
  defaultValue={'+1 555-555-5555'}
  onChange={(data) => this.onChangeHandler(data)}
/>
```

### Props

| Name | Prop Type | Default Prop | Details |
|:---- |:----------|:-------------|:--------|
| defaultValue | number, string | | Default phone number. Can be either an international or national number. Placing a `+` in front of the calling code will  allow the component to parse the number and automatically select the appropriate country. |
| preferredCountries | string[] | [] | Expects an array of ISO 3166-1 alpha-2 codes. Supplied values will be pushed to the top of the dropdown list. |
| onChange | func() | | Passes back data regarding current phone number such as validation status, selected country information, and currently entered phone number. |
| disabled | boolean | false | Toggles the disabled attribute of the tel input and country selector. |
| removeToken | element, string | `<span>&times;</span>` | Token on the right side of the input that clears typeahead and phonenumber values when clicked. |
| paginate | number | 50 | Specifies how many results to show at once in the dropdown list. |
| paginateText | element, string | Display additional results... | Text displayed once the user has scrolled to the bottom of the list. |
| noResultsMessage | string | No results available | Message displayed when the typeahead search term yields no results. |
| minLengthMessage | string | Too short to be a valid phone number | User friendly validation message returned by the `onChange` function when the phone number is too ***short***. |
| maxLengthMessage | string | Too long to be a valid phone number  | User friendly validation message returned by the `onChange` function when the phone number is too ***long***. |
| callingCodeMessage | string | Please select a valid country code | User friendly validation message returned by the `onChange` function when a invalid country code is entered. |
| catchAllMessage | string | Not a valid phone number | User friendly validation message returned by the `onChange` function when all other validation messages are not applicable. |
| validMessage | string | This phone number is valid | User friendly validation message returned by the `onChange` function when the phone number is valid. |
| placeholder | string | Search for a calling code by country | Placeholder of the tel input. |
| maxHeight | number | 300 | Max height of the country dropdown list. |
| defaultCountry | string | US | Default country to select when no `defaultValue` is supplied. |
| inputClassName | string | | Adds classNames to the tel input. |
| callingCodeDivider | element, string | `<span>/</span>` | Token used between calling codes in the dropdown list. |
| reset | boolean | | When set to true, the input will be reset to its `defaultValue` |

###### Note: All the validation messages are read to screen readers, so be sure to be descriptive!
