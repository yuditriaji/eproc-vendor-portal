# Contributing to E-Procurement Vendor Portal

Thank you for your interest in contributing to the E-Procurement Vendor Portal! This document provides guidelines for contributing to this project.

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/eproc-vendor-portal.git
   cd eproc-vendor-portal
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🏗 Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Environment Setup
1. Copy the environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Update the environment variables as needed
3. Start the development servers:
   ```bash
   # Frontend
   npm run dev
   
   # Mock API (in another terminal)
   node mock-api-server.js
   ```

## 📝 Development Guidelines

### Code Style
- **TypeScript**: Use strict mode, provide proper types
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Naming**: Use descriptive names for variables and functions

### Component Guidelines
- Use **functional components** with hooks
- Implement **proper TypeScript interfaces**
- Follow **React best practices**
- Use **Tailwind CSS** for styling
- Implement **responsive design**

### Git Commit Guidelines
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add two-factor authentication
fix(ui): resolve mobile navigation issue
docs(readme): update installation instructions
style(components): format button components
```

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Writing Tests
- Write tests for new features
- Update existing tests when modifying functionality
- Aim for good test coverage
- Use descriptive test names

## 🔒 Security

### Security Guidelines
- **Never commit** sensitive information (API keys, passwords, etc.)
- Use **environment variables** for configuration
- Follow **OWASP** security guidelines
- Validate all user inputs
- Use **HTTPS** for all external communications

### Reporting Security Issues
Please report security issues privately by emailing [security@yourproject.com] rather than using the public issue tracker.

## 🐛 Bug Reports

When filing a bug report, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected behavior**
4. **Actual behavior**
5. **Environment details** (OS, browser, Node.js version)
6. **Screenshots** if applicable

Use the bug report template:
```markdown
## Bug Description
Brief description of what went wrong.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happened.

## Environment
- OS: [e.g., macOS 12.0]
- Browser: [e.g., Chrome 95.0]
- Node.js: [e.g., 18.0.0]
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Search existing issues** first
2. **Describe the feature** clearly
3. **Explain the use case**
4. **Provide examples** if possible

Use the feature request template:
```markdown
## Feature Description
Clear description of the proposed feature.

## Use Case
Why is this feature needed?

## Proposed Solution
How do you think this should be implemented?

## Alternatives
Any alternative solutions you've considered.
```

## 📋 Pull Request Process

### Before Submitting
1. **Fork** the repository
2. **Create a feature branch**
3. **Make your changes**
4. **Test thoroughly**
5. **Update documentation**
6. **Follow code style guidelines**

### Pull Request Checklist
- [ ] Code follows the style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow convention

### Pull Request Template
```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (please describe)

## Testing
- [ ] Tests pass locally
- [ ] New tests added
- [ ] Manual testing completed

## Screenshots
If applicable, add screenshots.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

## 🏷 Release Process

### Versioning
We use [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps
1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create pull request
4. Merge after review
5. Create GitHub release
6. Deploy to production

## 📚 Documentation

### Documentation Guidelines
- Keep documentation **up to date**
- Use **clear, concise** language
- Include **code examples**
- Add **screenshots** for UI features
- Document **breaking changes**

### Types of Documentation
- **README**: Project overview and setup
- **API docs**: Endpoint documentation
- **Component docs**: Component usage
- **Architecture docs**: System design

## 🤝 Community

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Requests**: Code contributions

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/). Please be respectful and inclusive.

## ❓ Questions?

If you have questions about contributing:
- Check existing **GitHub Issues** and **Discussions**
- Create a new **Discussion** for general questions
- Create an **Issue** for specific problems

## 📄 License

By contributing, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

---

Thank you for contributing! 🎉