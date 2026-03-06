import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminUsersManager from '../AdminUsersManager';
import { useModal } from '@/app/components/ModalProvider';

// Mock the dependencies
jest.mock('@/app/components/ModalProvider', () => ({
  useModal: jest.fn(),
}));

const mockShowAlert = jest.fn();
const mockShowConfirm = jest.fn((title, message, onConfirm) => {
  // Auto-confirm in tests
  onConfirm();
});

const mockUsers = [
  {
    id: '1',
    name: 'Alice Registrant',
    email: 'alice@example.com',
    age: 25,
    pronouns: 'she/her',
    role: 'REGISTRANT',
    suspended: false,
    contactEmail: null,
    phoneNumber: null,
    instagram: null,
    discord: null,
    _count: { registrations: 2 },
  },
  {
    id: '2',
    name: 'Bob Admin',
    email: 'bob@example.com',
    age: 30,
    pronouns: 'he/him',
    role: 'ADMIN',
    suspended: false,
    contactEmail: null,
    phoneNumber: null,
    instagram: null,
    discord: null,
    _count: { registrations: 0 },
  },
];

describe('AdminUsersManager', () => {
  beforeEach(() => {
    (useModal as jest.Mock).mockReturnValue({
      showAlert: mockShowAlert,
      showConfirm: mockShowConfirm,
    });
    
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all users initially', () => {
    render(<AdminUsersManager initialUsers={mockUsers} />);
    
    expect(screen.getByText('All Registrants (2)')).toBeInTheDocument();
    expect(screen.getByText('Alice Registrant')).toBeInTheDocument();
    expect(screen.getByText('Bob Admin')).toBeInTheDocument();
  });

  it('displays the ADMIN badge for admin users', () => {
    render(<AdminUsersManager initialUsers={mockUsers} />);
    
    // Bob should have an ADMIN badge
    const adminBadge = screen.getByText('ADMIN');
    expect(adminBadge).toBeInTheDocument();
  });

  it('allows expanding a user to see more details and actions', () => {
    render(<AdminUsersManager initialUsers={mockUsers} />);
    
    const aliceRow = screen.getByText('Alice Registrant');
    fireEvent.click(aliceRow);

    // Expand view should show buttons
    expect(screen.getByText('Suspend User')).toBeInTheDocument();
    expect(screen.getByText('Make Admin')).toBeInTheDocument();
  });

  it('calls the role toggle API when the role change button is clicked', async () => {
    render(<AdminUsersManager initialUsers={mockUsers} />);
    
    // Open Alice
    fireEvent.click(screen.getByText('Alice Registrant'));

    // Click 'Make Admin'
    fireEvent.click(screen.getByText('Make Admin'));

    // showConfirm is mocked to auto-confirm
    // It should call the fetch API
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/users/1/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'ADMIN' }),
    });

    await waitFor(() => {
      expect(mockShowAlert).toHaveBeenCalledWith('Success', 'User role updated');
    });
  });

  it('calls the role toggle API with REGISTRANT for an admin user', async () => {
    render(<AdminUsersManager initialUsers={mockUsers} />);
    
    // Open Bob
    fireEvent.click(screen.getByText('Bob Admin'));

    // Click 'Make Registrant'
    fireEvent.click(screen.getByText('Make Registrant'));

    expect(global.fetch).toHaveBeenCalledWith('/api/admin/users/2/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'REGISTRANT' }),
    });
  });
});
