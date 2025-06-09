type ModifySuccessRS = {
  success: true
}

type ModifyFailRS = {
  success: false
  error: string
}

export type ModifyRS = ModifySuccessRS | ModifyFailRS


type AddSuccessRS = {
  success: true
}

type AddFailRS = {
  success: false
  internal_error_message: string
  user_error_message?: string
}

export type AddRS = AddSuccessRS | AddFailRS
