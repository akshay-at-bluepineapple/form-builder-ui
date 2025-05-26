import React from 'react';
import { useNavigate } from 'react-router-dom';

function FormListing() {
    const navigate = useNavigate();
    const [forms, setForms] = React.useState([]);

    const [users, setUsers] = React.useState([
        { name: 'Insurance User Form' },
        { name: 'Policy Holder Form' },
        { name: 'Insurance Customer Form' },
        { name: 'Policy Management Form' },
        { name: 'Policy Update Form' },
    ]);

    React.useEffect(() => {
        const sampleForms = [
            {
                form_name: "Insurance Customer Form",
                submit_api_route: "/api/forms/insurance-customer/submit/",
                sections: [
                    {
                        section_name: "Personal Details",
                        is_collapsable: true,
                        section_order: 1,
                        rows: [
                            {
                                row_name: "Basic Info",
                                row_order: 1,
                                columns: [
                                    {
                                        column_name: "Full Name Column", // add if needed
                                        column_order: 1,
                                        fields: [
                                            {
                                                config: {
                                                    field_type: "text",
                                                    label: "Full Name",
                                                    placeholder: "Enter full name",
                                                    required: true
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        column_name: "DOB Column",
                                        column_order: 2,
                                        fields: [
                                            {
                                                config: {
                                                    field_type: "date",
                                                    label: "Date of Birth",
                                                    placeholder: "Select your date of birth",
                                                    required: true
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        column_name: "Empty Column",
                                        column_order: 3,
                                        fields: []
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        section_name: "Contact Details",
                        is_collapsable: false,
                        section_order: 2,
                        rows: [
                            {
                                row_name: "Email & Phone",
                                row_order: 1,
                                columns: [
                                    {
                                        column_name: "Email Column",
                                        column_order: 1,
                                        fields: [
                                            {
                                                config: {
                                                    field_type: "email",
                                                    label: "Email",
                                                    placeholder: "Enter email"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        column_name: "Phone Column",
                                        column_order: 2,
                                        fields: [
                                            {
                                                config: {
                                                    field_type: "tel",
                                                    label: "Phone",
                                                    placeholder: "Enter phone number"
                                                }
                                            }
                                        ]
                                    },
                                    {
                                        column_name: "Empty Column",
                                        column_order: 3,
                                        fields: []
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
        ];

        setForms(sampleForms);
    }, []);
    // useEffect(() => {
    //     axios.get('http://localhost:8000/forms/')
    //         .then(response => {
    //             setForms(response.data);
    //         })
    //         .catch(error => {
    //             console.error("Error fetching forms:", error);
    //         });
    // }, []);

    return (

        <div className="text-gray-900 bg-gray-200">
            <div className="p-4 flex justify-between items-center">
                <h1 className="text-3xl">
                    Forms
                </h1>
                <button onClick={() => navigate('/forms/new')}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded transition">
                    Create Form
                </button>
            </div>
            <div className="px-3 py-4 flex justify-center">
                <table className="w-full text-md bg-white shadow-md rounded mb-4">
                    <tbody>
                        <tr className="border-b">
                            <th className="text-left p-3 px-5">Name</th>
                            <th></th>
                        </tr>
                        {forms.map((form, index) => (
                            <tr key={form.formId} className="border-b bg-gray-100 hover:bg-blue-50 transition">

                                <td className="p-3 px-5"><input type="text" value={form.form_name} className="bg-transparent" /></td>

                                <td className="p-3 px-5 flex justify-end space-x-3">

                                    <button type="button"
                                        onClick={() => navigate(`/forms/${index}/edit`, { state: { preview: true, form } })}
                                        className="text-sm bg-gray-300 hover:bg-gray-400 text-gray-800 py-1 px-3 rounded focus:outline-none focus:shadow-outline transition"
                                    >
                                        View
                                    </button>
                                    <button type="button"
                                        onClick={() => navigate(`/forms/${index}/edit`)}
                                        className="text-sm bg-orange-300 hover:bg-orange-400 text-gray-800 py-1 px-3 rounded focus:outline-none focus:shadow-outline transition"
                                    >
                                        Edit</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default FormListing;