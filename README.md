#include <iostream>
using namespace std;

// Functions
void showDefinition() {
    cout << "\nDefinition:\n";
    cout << "Organizing and planning company work to achieve success.\n";
}

void showDepartments() {
    cout << "\nDepartments:\n";
    cout << "1. Financial Management\n";
    cout << "2. Human Resources (HR)\n";
    cout << "3. Marketing\n";
}

void showFunctions() {
    cout << "\nManagement Functions:\n";
    cout << "Planning - Organizing - Directing - Controlling\n";
}

int main() {
    string company;
    int choice;
    char again;

    // User input
    cout << "Enter company name: ";
    cin >> company;

    cout << "\nWelcome to " << company << " Management System!\n";

    // Loop for repeating menu
    do {
        cout << "\n=================================\n";
        cout << "   Business Management System\n";
        cout << "=================================\n";

        cout << "1. Definition\n";
        cout << "2. Departments\n";
        cout << "3. Management Functions\n";
        cout << "4. Exit\n";

        cout << "Enter your choice: ";
        cin >> choice;

        // Conditions
        switch (choice) {
            case 1:
                showDefinition();
                break;
            case 2:
                showDepartments();
                break;
            case 3:
                showFunctions();
                break;
            case 4:
                cout << "Goodbye!\n";
                return 0;
            default:
                cout << "Invalid choice! Try again.\n";
        }

        cout << "\nDo you want to continue? (y/n): ";
        cin >> again;

    } while (again == 'y' || again == 'Y');
