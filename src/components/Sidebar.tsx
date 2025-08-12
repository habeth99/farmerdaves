'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSignInContext } from '../utils/authService';
import { Cart } from '../../models/cart';

export default function Sidebar() {
  // Sidebar is deprecated in favor of TopNav. Render nothing.
  return null;
} 