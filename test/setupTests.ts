import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest APIs are imported explicitly, so register RTL cleanup explicitly too.
afterEach(cleanup);
