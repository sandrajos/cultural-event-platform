import React from 'react';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EventsPage from '@/pages/events/EventsPage';
import EventDetailPage from '@/pages/events/EventDetailPage';
import EventFormPage from '@/pages/events/EventFormPage';
import EditEventPage from '@/pages/events/EditEventPage';
import VenuesPage from '@/pages/venues/VenuesPage';
import VenueDetailPage from '@/pages/venues/VenueDetailPage';
import VenueFormPage from '@/pages/venues/VenueFormPage';
import ArtistsPage from '@/pages/artists/ArtistsPage';
import ArtistDetailPage from '@/pages/artists/ArtistDetailPage';
import ArtistFormPage from '@/pages/artists/ArtistFormPage';
import TicketsPage from '@/pages/tickets/TicketsPage';
import AdminPage from '@/pages/admin/AdminPage';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  // Root = Login
  { name: 'Login', path: '/', element: <LoginPage />, public: true },

  // Auth
  { name: 'Login Alt', path: '/auth/login', element: <LoginPage />, public: true },
  { name: 'Register', path: '/auth/register', element: <RegisterPage />, public: true },

  // Dashboard
  { name: 'Dashboard', path: '/dashboard', element: <DashboardPage /> },

  // Events
  { name: 'Events', path: '/events', element: <EventsPage />, public: true },
  { name: 'Event Detail', path: '/events/:id', element: <EventDetailPage />, public: true },
  { name: 'Create Event', path: '/events/create', element: <EventFormPage mode="create" /> },
  { name: 'Edit Event', path: '/events/:id/edit', element: <EditEventPage /> },

  // Venues
  { name: 'Venues', path: '/venues', element: <VenuesPage />, public: true },
  { name: 'Venue Detail', path: '/venues/:id', element: <VenueDetailPage />, public: true },
  { name: 'Create Venue', path: '/venues/create', element: <VenueFormPage mode="create" /> },
  { name: 'Edit Venue', path: '/venues/:id/edit', element: <VenueFormPage mode="edit" /> },

  // Artists
  { name: 'Artists', path: '/artists', element: <ArtistsPage />, public: true },
  { name: 'Artist Detail', path: '/artists/:id', element: <ArtistDetailPage />, public: true },
  { name: 'Create Artist', path: '/artists/create', element: <ArtistFormPage mode="create" /> },
  { name: 'Edit Artist', path: '/artists/:id/edit', element: <ArtistFormPage mode="edit" /> },

  // Tickets
  { name: 'Tickets', path: '/tickets', element: <TicketsPage /> },

  // Admin
  { name: 'Admin', path: '/admin', element: <AdminPage /> },
];
