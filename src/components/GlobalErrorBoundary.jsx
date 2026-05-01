import React from 'react'
import { Result, Button, Typography, Card } from 'antd'

const { Paragraph, Text } = Typography

export class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error) {
        // Actualiza el estado para que la próxima renderización muestre la IU de repuesto
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        // También puedes registrar el error en un servicio de reporte de errores como Sentry
        console.error('Uncaught error in application:', error, errorInfo)
        this.setState({ errorInfo })
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
                    <Card style={{ maxWidth: 600, width: '100%', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <Result
                            status="500"
                            title="500 - Error Inesperado"
                            subTitle="Lo sentimos, algo salió mal en la aplicación."
                            extra={
                                <Button type="primary" onClick={this.handleReload} size="large">
                                    Recargar la página
                                </Button>
                            }
                        >
                            <div className="desc">
                                <Paragraph>
                                    <Text strong style={{ fontSize: 16 }}>
                                        Detalles técnicos del error (para soporte):
                                    </Text>
                                </Paragraph>
                                <Paragraph>
                                    <pre style={{ backgroundColor: '#fffbe6', padding: '12px', border: '1px solid #ffe58f', borderRadius: 8, overflowX: 'auto', fontSize: 12 }}>
                                        {this.state.error?.toString()}
                                    </pre>
                                </Paragraph>
                            </div>
                        </Result>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
