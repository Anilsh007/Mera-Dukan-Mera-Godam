export default function InvoicePreview({ invoice }: any) {
    return (
        <div className="bg-white text-black p-6 rounded-xl shadow">

            <h2 className="text-xl font-bold mb-4">Tax Invoice</h2>

            <div className="flex justify-between text-sm mb-4">
                <div>
                    <p className="font-semibold">{invoice.seller.name}</p>
                    <p>{invoice.seller.address}</p>
                    <p>GSTIN: {invoice.seller.gstin}</p>
                </div>

                <div>
                    <p>Invoice: {invoice.invoiceNo}</p>
                    <p>Date: {invoice.invoiceDate}</p>
                </div>
            </div>

            <table className="w-full text-sm border">
                <thead className="bg-gray-100">
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                    </tr>
                </thead>

                <tbody>
                    {invoice.items.map((item: any, i: number) => (
                        <tr key={i}>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{item.rate}</td>
                            <td>{item.total}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-right mt-4">
                <p>Total: ₹{invoice.totals.grandTotal}</p>
                <p className="italic">{invoice.totals.amountInWords}</p>
            </div>
        </div>
    )
}