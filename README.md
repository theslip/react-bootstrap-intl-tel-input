# react-bootstrap-intl-tel-input
React international telephone input built on bootstrap v4

## Props

| Name | Prop Type | Default Prop       | Details
|:---- |:----------|:-------------------|:--------|
| defaultValue | number, string | | Default phone number. Can be either an international or national number. Placing a `+` in front of the calling code will  allow the component to parse the number and automatically select the appropriate country. |
| preferredCountries | string[] | [] | Expects an array of ISO 3166-1 alpha-2 codes. Supplied values will be pushed to the top of the dropdown list. |
| onChange | func() | | Passes back data regarding current phone number such as validation status, selected country information, and currently entered phone number. |
| disabled | boolean | false | Toggles the disabled attribute the input and country selector. |
| removeToken | element, string | `<span>&times;</span>` | Token on the right side of the input that clears typeahead and phonenumber values when clicked. |
| paginate | number | 50 | Threshold to paginate to. User has the option to load more after scrolling to the bottom of the list. |
| paginateText | element, string | Display additional results... | Text displayed once the user has scrolled to the bottom of the list. |
| noResultsMessage | string | No results available | Message displayed when the typeahead search term yields no results. |
| minLengthMessage | string | Too short to be a valid phone number | User friendly validation message returned by the `onChange` function when the phone number is too ***short*** to be valid. |
| maxLengthMessage | string | Too long to be a valid phone number  | User friendly validation message returned by the `onChange` function when the phone number is too ***long*** to be valid. | 
| callingCodeMessage | string | Please select a valid country code | User friendly validation message returned by the `onChange` function when a invalid country code is entered. |
| catchAllMessage | string | Not a valid phone number | User friendly validation message returned by the `onChange` function when all other validation messages are not applicable. |
| validMessage | string | This phone number is valid | User friendly validation message returned by the `onChange` function when the phone number is valid. |
| placeholder | string | Search for a calling code by country | |
| maxHeight | number | 300 | |
| defaultCountry | string | US | |
| inputID | string, number | intl-tel-input | |
| dropdownID | string, number | country-selector-dropdown | |
| inputClassName | string | | |
| callingCodeDivider | element, string | `<span>/</span>` | Token used between calling codes when a country has multiple codes. |
| reset | boolean | | When set to true, the input will be reset to its defaultValue |

###### Note: All the validation messages are read to screen readers, so be sure to be descriptive!

