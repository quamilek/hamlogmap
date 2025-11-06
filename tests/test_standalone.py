"""
Standalone test for file validation without Flask dependencies.
"""

def allowed_file(filename):
    """Check if the uploaded file has an allowed extension (ADIF or ADI)"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'adif', 'adi'}


def test_file_validation():
    """Test file validation functionality."""
    print('Testing allowed_file function...')
    
    # Test valid files
    valid_files = [
        'test.adif', 'test.adi', 'TEST.ADIF', 'TEST.ADI',
        'my_log.adif', 'contest.adi', 'file.ADIF', 'log.ADI'
    ]
    
    print('\nTesting valid files:')
    for filename in valid_files:
        result = allowed_file(filename)
        status = "✓ PASS" if result else "✗ FAIL"
        print(f'  {filename:20} -> {status}')
        assert result, f'Valid file {filename} should be allowed'
    
    # Test invalid files
    invalid_files = [
        'test.txt', 'test.csv', 'test.pdf', 'invalid.log',
        'no_extension', '', 'adif.txt', 'file.adif.txt'
    ]
    
    print('\nTesting invalid files:')
    for filename in invalid_files:
        result = allowed_file(filename)
        status = "✓ PASS" if not result else "✗ FAIL"
        print(f'  {filename:20} -> {status}')
        assert not result, f'Invalid file {filename} should not be allowed'
    
    # Test case sensitivity
    case_files = [
        ('test.adif', True), ('test.ADIF', True), ('test.AdIf', True),
        ('test.adi', True), ('test.ADI', True), ('test.AdI', True)
    ]
    
    print('\nTesting case sensitivity:')
    for filename, expected in case_files:
        result = allowed_file(filename)
        status = "✓ PASS" if result == expected else "✗ FAIL"
        print(f'  {filename:20} -> {status}')
        assert result == expected, f'Case test failed for {filename}'
    
    # Test edge cases
    edge_cases = [
        ('.adif', True),           # Hidden file
        ('.adi', True),            # Hidden file
        ('file.log.adif', True),   # Multiple dots
        ('test.adif.bak', False),  # Ends with different extension
    ]
    
    print('\nTesting edge cases:')
    for filename, expected in edge_cases:
        result = allowed_file(filename)
        status = "✓ PASS" if result == expected else "✗ FAIL"
        expected_str = "allowed" if expected else "not allowed"
        print(f'  {filename:20} -> {status} (should be {expected_str})')
        assert result == expected, f'Edge case failed for {filename}'
    
    print('\n🎉 All file validation tests passed successfully!')
    print(f'   Total tests run: {len(valid_files) + len(invalid_files) + len(case_files) + len(edge_cases)}')


if __name__ == '__main__':
    test_file_validation()