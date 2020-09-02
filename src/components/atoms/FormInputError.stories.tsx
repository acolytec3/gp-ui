import React from 'react'
import { FormInputError, Props } from 'components/atoms/FormInputError'

// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'

export default {
  title: 'Atoms/FormInputError',
} as Meta

const Template: Story<Props> = (args) => <FormInputError {...args} />

export const ErrorMessage = Template.bind({})
ErrorMessage.args = {
  errorMessage: 'Something broke',
}
