// Copyright (c) 2026 David Dallet
// Licensed under BSL 1.1 - see LICENSE file

export * from './youtube';

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}
