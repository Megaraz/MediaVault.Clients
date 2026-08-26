# Android accessibility

The Android app uses React Native accessibility props so TalkBack can announce
each interactive control's purpose and current state. Keep a visible text
label as the default accessible name; add an explicit `accessibilityLabel`
when a control is icon-only or its visible content does not describe its
action.

- Use `accessibilityRole="button"` for actions and `"radio"` plus
  `accessibilityState={{ selected }}` for mutually exclusive filters,
  selections, and rating choices.
- Include `disabled` and `busy` in `accessibilityState` whenever a request can
  temporarily prevent interaction.
- Use `accessibilityLiveRegion="polite"` for changing status and empty-state
  feedback. Use an alert role or assertive live region for failures that need
  immediate attention.
- Core action targets must be at least 44 by 44 logical pixels. The rating
  control is the documented exception: two independently focusable 0.5-step
  targets share each 44 by 44 star to retain the existing five-star visual
  layout. TalkBack labels, selected state, current value, and the Clear action
  provide the operable alternative; confirm these targets on a real device
  before release.

Before releasing a change that affects navigation, forms, search, or media
editing, manually exercise the flow with TalkBack enabled on a supported Android
emulator or device. Verify selected filters, rating value changes, validation
failures, slow-loading feedback, destructive-action cancellation, and close
controls.
