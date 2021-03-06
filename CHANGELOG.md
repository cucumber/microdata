# CHANGE LOG
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

----
## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

## [1.5.0]

### Changed

* Primitive types using `itemtype="http://schema.org/Integer"` etc. with `http:` protocol are no longer recognised.
  Starting with this version it only recognises `itemtype="https://schema.org/Integer"` etc. with `https:` protocol.
  See [this post](https://stackoverflow.com/questions/55242400/itemtype-with-http-or-better-https) for more details.

### Added

* Added `toArray` utility function to convert children into an array of 0, 1 or more objects

## [1.4.0]

### Added

* Improve types to accept document as a scope [#8](https://github.com/cucumber/microdata/pull/8)

## [1.3.0]

### Added

* Support all specific [DataType](https://schema.org/DataType) subtypes.

## [1.2.1]

### Fixed

* Better error messages when attributes are missing

## [1.2.0] - 2020-04-02

### Added

* An optional `(element: Element) => string | undefined` function can be passed as the last argument to
  provide a custom function to look up element values. This is useful for extracting values from non-standard
  elements, such as a [CodeMirror](https://codemirror.net/) editor.

## [1.1.0] - 2019-03-16

### Changed

* `microdata` and `microdataAll` return generic types

## [1.0.1] - 2019-03-16

### Fixed

* Trim text content on multiple lines

## [1.0.0] - 2019-03-16

### Added

* First release

<!-- Releases -->
[Unreleased]: https://github.com/cucumber/microdata/compare/v1.5.0...master
[1.5.0]:      https://github.com/cucumber/microdata/compare/v1.4.0...v1.5.0
[1.4.0]:      https://github.com/cucumber/microdata/compare/v1.3.0...v1.4.0
[1.3.0]:      https://github.com/cucumber/microdata/compare/v1.2.1...v1.3.0
[1.2.1]:      https://github.com/cucumber/microdata/compare/v1.2.0...v1.2.1
[1.2.0]:      https://github.com/cucumber/microdata/compare/v1.1.0...v1.2.0
[1.1.0]:      https://github.com/cucumber/microdata/compare/v1.0.1...v1.1.0
[1.0.1]:      https://github.com/cucumber/microdata/compare/v1.0.0...v1.0.1
[1.0.0]:      https://github.com/cucumber/microdata/releases/tag/v1.0.0

<!-- Contributors in alphabetical order -->
[aslakhellesoy]:    https://github.com/aslakhellesoy
[motiejunas]:       https://github.com/motiejunas
