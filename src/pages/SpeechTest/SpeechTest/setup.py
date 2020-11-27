from setuptools import setup

setup(
    name='SpeechTest',
    version='0.1.0',
    include_package_data=True,
    install_requires=[
        'bs4',
        'Flask',
        'html5validator',
        'pycodestyle',
        'pydocstyle',
        'pylint',
        'pytest',
        'requests',
    ],
    python_requires='>=3.6',
)
