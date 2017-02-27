# react-bootstrap-intl-tel-input
React international telephone input built on bootstrap v4

## Props

| Name | Prop Type | Default Prop | Details
|:---- |:----------|:-------------|:--------|
| defaultValue | number, string | | Default phone number. Can be either an international or national number. Placing a `+` in front of the calling code will  allow the component to parse the number and automatically select the appropriate country. |
| preferredCountries | string[] | [] | Expects an array of ISO 3166-1 alpha-2 codes. Supplied values will be pushed to the top of the dropdown list. |
| onChange | func() | | Passes back data regarding current phone number such as validation status, selected country information, and currently entered phone number. |
| disabled           | boolean         | false                                |                                              |
| removeToken        | element, string | `<span>&times;</span>`               |                                              |
| paginate           | number          | 50                                   |                                              |
| paginateText       | element, string | Display additional results...        |                                              |
| noResultsMessage   | string          | No results available                 |                                              |
| minLengthMessage   | string          | Too short to be a valid phone number |                                              |
| maxLengthMessage   | string          | Too long to be a valid phone number  |                                              | 
| callingCodeMessage | string          | Please select a valid country code   |                                              |
| catchAllMessage    | string          | Not a valid phone number             |                                              |
| validMessage       | string          | This phone number is valid           |                                              |
| placeholder        | string          | Search for a calling code by country |                                              |
| maxHeight          | number          | 300                                  |                                              |
| defaultCountry     | string          | US                                   |                                              |
| inputID            | string, number  | intl-tel-input                       |                                              |
| dropdownID         | string, number  | country-selector-dropdown            |                                              |
| inputClassName     | string          |                                      |                                              |
| callingCodeDivider | element, string | `<span>/</span>`                     |                                              |
| reset              | boolean         |                                      |                                              |
