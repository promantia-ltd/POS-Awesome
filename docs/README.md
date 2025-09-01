# POS Awesome Documentation

## Overview
POS Awesome is an advanced Point of Sale application built for ERPNext using Vue.js 3 and Vuetify 3. It provides a modern, responsive, and feature-rich POS interface designed for retail and hospitality businesses.

## Table of Contents
1. [Architecture Overview](./architecture.md)
2. [Installation Guide](./installation.md)
3. [Configuration Guide](./configuration.md)
4. [API Reference](./api-reference.md)
5. [Frontend Components](./frontend-components.md)
6. [Developer Guide](./developer-guide.md)
7. [Features Documentation](./features.md)
8. [Troubleshooting](./troubleshooting.md)

## Quick Start

### Prerequisites
- ERPNext Version 15
- Frappe Framework
- Node.js 18+
- Python 3.10+

### Installation
```bash
bench get-app branch version-14 https://github.com/yrestom/POS-Awesome.git
bench setup requirements
bench build --app posawesome
bench restart
bench --site [your.site.name] install-app posawesome
bench --site [your.site.name] migrate
```

### Basic Configuration
1. Navigate to POS Profile in ERPNext
2. Enable POS Awesome Settings
3. Configure payment methods
4. Set up item groups and pricing
5. Configure tax templates

## Key Features
- Modern Vue.js 3 interface with Vuetify components
- Real-time inventory management
- Multiple payment methods support
- Customer loyalty programs
- Promotional offers and coupons
- Batch and serial number tracking
- Multi-currency support
- Offline capability with local storage
- Mobile-responsive design

## Support
- [GitHub Issues](https://github.com/yrestom/POS-Awesome/issues)
- [Wiki](https://github.com/yrestom/POS-Awesome/wiki)
- Email: info@totrox.com

## License
GNU General Public License v3.0