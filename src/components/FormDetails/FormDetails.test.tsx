import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { FormDetails } from './FormDetails'
import blueprintReducer from '../../store/slices/blueprintSlice'
import prefillMappingReducer from '../../store/slices/prefillMappingSlice'

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock child components
vi.mock('./PrefillMappingView', () => ({
  PrefillMappingView: ({ handleFieldClick, onClose }: any) => (
    <div data-testid="prefill-mapping-view">
      <button data-testid="view-close" onClick={onClose}>
        Close
      </button>
      <button data-testid="field-button-email" onClick={() => handleFieldClick('email')}>
        Email Field
      </button>
      <button data-testid="field-button-name" onClick={() => handleFieldClick('name')}>
        Name Field
      </button>
    </div>
  ),
}))

vi.mock('./PrefillMappingEditor', () => ({
  PrefillMappingEditor: ({ selectedFieldKey, onCancel }: any) => (
    <div data-testid="prefill-mapping-editor">
      <div data-testid="selected-field">{selectedFieldKey}</div>
      <button data-testid="editor-cancel" onClick={onCancel}>
        Cancel
      </button>
    </div>
  ),
}))

function renderWithRedux(
  ui: React.ReactElement,
  {
    preloadedState,
    store,
  }: {
    preloadedState?: any
    store?: any
  } = {}
) {
  const defaultStore = configureStore({
    reducer: {
      blueprint: blueprintReducer,
      prefillMapping: prefillMappingReducer,
    },
    preloadedState,
  } as any)

  return {
    ...render(<Provider store={store || defaultStore}>{ui}</Provider>),
    store: store || defaultStore,
  }
}

describe('FormDetails', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial render', () => {
    it('should render in view mode by default', () => {
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
      expect(screen.queryByTestId('prefill-mapping-editor')).not.toBeInTheDocument()
    })

    it('should pass onClose prop to PrefillMappingView', () => {
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      const closeButton = screen.getByTestId('view-close')
      closeButton.click()

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('mode switching', () => {
    it('should switch to edit mode when field is clicked', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      const emailField = screen.getByTestId('field-button-email')
      await user.click(emailField)

      await waitFor(() => {
        expect(screen.queryByTestId('prefill-mapping-view')).not.toBeInTheDocument()
        expect(screen.getByTestId('prefill-mapping-editor')).toBeInTheDocument()
      })
    })

    it('should pass selected field to editor', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      const emailField = screen.getByTestId('field-button-email')
      await user.click(emailField)

      await waitFor(() => {
        expect(screen.getByTestId('selected-field')).toHaveTextContent('email')
      })
    })

    it('should return to view mode when cancel is clicked', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      // Switch to edit mode
      await user.click(screen.getByTestId('field-button-email'))
      
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-editor')).toBeInTheDocument()
      })

      // Cancel back to view
      await user.click(screen.getByTestId('editor-cancel'))

      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
        expect(screen.queryByTestId('prefill-mapping-editor')).not.toBeInTheDocument()
      })
    })

    it('should clear selected field when canceling', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      // Select field and switch to edit
      await user.click(screen.getByTestId('field-button-email'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-field')).toHaveTextContent('email')
      })

      // Cancel
      await user.click(screen.getByTestId('editor-cancel'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
      })

      // Select different field
      await user.click(screen.getByTestId('field-button-name'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-field')).toHaveTextContent('name')
      })
    })
  })

  describe('state transitions', () => {
    it('should handle complete view-edit-view cycle', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      // Start in view mode
      expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()

      // Switch to edit
      await user.click(screen.getByTestId('field-button-email'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-editor')).toBeInTheDocument()
        expect(screen.queryByTestId('prefill-mapping-view')).not.toBeInTheDocument()
      })

      // Back to view
      await user.click(screen.getByTestId('editor-cancel'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
        expect(screen.queryByTestId('prefill-mapping-editor')).not.toBeInTheDocument()
      })
    })

    it('should handle multiple edit sessions', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      // First edit session
      await user.click(screen.getByTestId('field-button-email'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-editor')).toBeInTheDocument()
      })
      
      await user.click(screen.getByTestId('editor-cancel'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
      })

      // Second edit session
      await user.click(screen.getByTestId('field-button-name'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-field')).toHaveTextContent('name')
      })
      
      await user.click(screen.getByTestId('editor-cancel'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
      })

      // Third edit session
      await user.click(screen.getByTestId('field-button-email'))
      await waitFor(() => {
        expect(screen.getByTestId('selected-field')).toHaveTextContent('email')
      })
    })
  })

  describe('onClose callback', () => {
    it('should call onClose when close button is clicked in view mode', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      await user.click(screen.getByTestId('view-close'))

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not call onClose when switching modes', async () => {
      const user = userEvent.setup()
      renderWithRedux(<FormDetails onClose={mockOnClose} />)

      await user.click(screen.getByTestId('field-button-email'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-editor')).toBeInTheDocument()
      })
      expect(mockOnClose).not.toHaveBeenCalled()

      await user.click(screen.getByTestId('editor-cancel'))
      await waitFor(() => {
        expect(screen.getByTestId('prefill-mapping-view')).toBeInTheDocument()
      })
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })
})

