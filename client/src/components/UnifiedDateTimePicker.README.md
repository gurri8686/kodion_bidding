# UnifiedDateTimePicker Component

A reusable date and time picker component that uses `react-date-range` for consistent date selection throughout the project.

## Features

- Consistent date selection using `react-date-range` across the entire application
- Optional time selection with hour, minute, and AM/PM controls
- Dropdown positioning (above or below the input)
- Clean, modern UI with hover effects
- Click-outside to close functionality
- Full TypeScript-ready prop interface

## Installation

The component is already set up and uses the following dependencies:
- `react-date-range` - For date selection
- `date-fns` - For date formatting
- `lucide-react` - For icons

## Basic Usage

### Date Only (No Time)

```jsx
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";
import { useState } from "react";

function MyComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <UnifiedDateTimePicker
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      withTime={false}
    />
  );
}
```

### Date and Time

```jsx
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";
import { useState } from "react";

function MyComponent() {
  const [appliedAt, setAppliedAt] = useState(new Date());

  return (
    <UnifiedDateTimePicker
      selectedDate={appliedAt}
      setSelectedDate={setAppliedAt}
      withTime={true}
      position="above"
    />
  );
}
```

### With Formik

```jsx
import { useFormik } from "formik";
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";

function MyForm() {
  const formik = useFormik({
    initialValues: {
      appliedAt: new Date().toISOString(),
    },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <label>Applied Date</label>
      <UnifiedDateTimePicker
        selectedDate={new Date(formik.values.appliedAt)}
        setSelectedDate={(date) =>
          formik.setFieldValue("appliedAt", date.toISOString())
        }
        position="above"
        withTime={true}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectedDate` | `Date` | *required* | Currently selected date |
| `setSelectedDate` | `(date: Date) => void` | *required* | Callback function to update the selected date |
| `position` | `"above" \| "below"` | `"below"` | Position of the dropdown relative to the input |
| `withTime` | `boolean` | `false` | Enable time selection with hour, minute, and AM/PM controls |

## Examples in the Project

The component is currently used in:

1. **ApplyManualJob Modal** ([ApplyManualJob.jsx](../modals/ApplyManualJob.jsx))
   - Date and time selection for job application date

2. **EditAppliedModal** ([EditAppliedModal.jsx](../modals/EditAppliedModal.jsx))
   - Date and time selection for editing applied job date

3. **ScrapeLogs Page** ([ScrapeLogs.jsx](../pages/dashboard/ScrapeLogs.jsx))
   - Date-only selection for filtering logs

4. **Connects Page** ([Connects.jsx](../admin/Connects.jsx))
   - Date-only selection for viewing connects by date

## Styling

The component uses Tailwind CSS classes and includes:
- Hover effects on the input field
- Focus rings on time selectors
- Responsive dropdown positioning
- Clean, modern design that matches the rest of the application

## Migration from SingleDatePicker

If you're migrating from the old `SingleDatePicker` component:

**Before:**
```jsx
import { SingleDatePicker } from "../admin/components/SingleDatePicker";

<SingleDatePicker
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  withTime={true}
  position="above"
/>
```

**After:**
```jsx
import { UnifiedDateTimePicker } from "../components/UnifiedDateTimePicker";

<UnifiedDateTimePicker
  selectedDate={selectedDate}
  setSelectedDate={setSelectedDate}
  withTime={true}
  position="above"
/>
```

The API is identical, so it's a drop-in replacement!

## Notes

- The component uses `react-date-range` for date selection to maintain consistency across the application
- Time selection is custom-built since `react-date-range` doesn't support time
- The dropdown automatically closes when clicking outside
- Time format is 12-hour with AM/PM
- Dates are stored as JavaScript `Date` objects
