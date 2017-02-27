# react-bootstrap-intl-tel-input
React international telephone input built on bootstrap v4

### Props

| Name               | Type            | Default                                                  |
|--------------------|-----------------|----------------------------------------------------------|
| defaultValue       | number, string  |                                                          |
| preferredCountries | string[]        | []                                                       |
| onChange           | func()          |                                                          |
| disabled           | boolean         | false                                                    |
| removeToken        | element, string | `<span>&times;</span>`                                   |
| paginate           | number          | 50                                                       |
| paginateText       | element, string | Display additional results...                            |
| noResultsMessage   | string          | No results available                                     |
| minLengthMessage   | string          | Too short to be a valid phone number                     |
| maxLengthMessage   | string          | Too long to be a valid phone number                      |
| callingCodeMessage | string          | Please select a valid country code                       |
| catchAllMessage    | string          | Not a valid phone number                                 |
| validMessage       | string          | This phone number is valid                               |
| placeholder        | string          | Search for a calling code by country name                |
| maxHeight          | number          | 300                                                      |
| defaultCountry     | string          | US                                                       |
| inputID            | string, number  | intl-tel-input                                           |
| dropdownID         | string, number  | country-selector-dropdown                                |
| inputClassName     | string          |                                                          |
| callingCodeDivider | element, string | `<span style={{marginLeft: 4, marginRight: 4}}>/</span>` |
| reset              | boolean         |                                                          |
